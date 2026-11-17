import { define } from "nona:ffi";
import {
    CloseHandle,
    CreateMutexW,
    ERROR_FILE_NOT_FOUND,
    ERROR_SUCCESS,
    HKEY_CURRENT_USER,
    REG_SZ,
    RegCloseKey,
    RegCreateKeyExW,
    RegDeleteValueW,
    RegOpenKeyExW,
    RegSetValueExW,
    ReleaseMutex,
    fromWideString,
    lastError,
    readHandle,
    wideString,
} from "nona:win32";

const CreateEventW = define("kernel32.dll", "CreateEventW", "ptr(ptr,bool,bool,wstr)");
const SetEvent = define("kernel32.dll", "SetEvent", "bool(ptr)");
const ResetEvent = define("kernel32.dll", "ResetEvent", "bool(ptr)");
const WaitForSingleObject = define("kernel32.dll", "WaitForSingleObject", "u32(ptr,u32)");
const WaitForMultipleObjects = define("kernel32.dll", "WaitForMultipleObjects", "u32(u32,buf,bool,u32)");
const OpenProcess = define("kernel32.dll", "OpenProcess", "ptr(u32,bool,u32)");
const QueryFullProcessImageNameW = define("kernel32.dll", "QueryFullProcessImageNameW", "bool(ptr,u32,buf,buf)");
const FindWindowExW = define("user32.dll", "FindWindowExW", "ptr(ptr,ptr,wstr,wstr)");
const GetWindowThreadProcessId = define("user32.dll", "GetWindowThreadProcessId", "u32(ptr,buf)");
const SetForegroundWindow = define("user32.dll", "SetForegroundWindow", "bool(ptr)");
const IsWindow = define("user32.dll", "IsWindow", "bool(ptr)");
const PostMessageW = define("user32.dll", "PostMessageW", "bool(ptr,u32,ptr,ptr)");

export const WAIT_STOP = 0;
export const WAIT_SETTINGS = 1;
export const WAIT_TIMEOUT = 258;
export const INFINITE = 0xffffffff;
const WAIT_ABANDONED = 128;
const WM_CLOSE = 0x0010;
const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
const KEY_SET_VALUE = 0x0002;
const RUN_KEY = "Software\\Microsoft\\Windows\\CurrentVersion\\Run";
const RUN_VALUE = "Museum";
const INSTANCE_NAME = "Local\\Museum.Native";
const SETTINGS_TITLE = "Настройки Museum";

function windowsError(action) {
    return new Error(`${action} (Win32 error ${lastError()})`);
}

function writeHandle(view, offset, handle) {
    view.setUint32(offset, handle >>> 0, true);
    view.setUint32(offset + 4, Math.floor(handle / 4294967296), true);
}

// Create both events before exposing the mutex. A second launcher can signal
// as soon as the owner acquires it, even before the owner's first wait.
export class Instance {
    constructor(name = INSTANCE_NAME) {
        this.stop = 0;
        this.settings = 0;
        this.mutex = 0;
        this.ownsMutex = false;
        try {
            this.stop = CreateEventW(0, false, false, `${name}.Stop`);
            if (!this.stop) throw windowsError("Cannot create the Museum stop event");
            this.settings = CreateEventW(0, false, false, `${name}.Settings`);
            if (!this.settings) throw windowsError("Cannot create the Museum settings event");
            this.mutex = CreateMutexW(0, false, `${name}.Owner`);
            if (!this.mutex) throw windowsError("Cannot create the Museum mutex");
            this.events = new Uint8Array(16);
            const view = new DataView(this.events.buffer);
            writeHandle(view, 0, this.stop);
            writeHandle(view, 8, this.settings);
        } catch (error) {
            this.close();
            throw error;
        }
    }

    acquire(timeout = 0) {
        const result = WaitForSingleObject(this.mutex, timeout);
        if (result === WAIT_TIMEOUT) return false;
        if (result !== 0 && result !== WAIT_ABANDONED) {
            throw windowsError("Cannot acquire the Museum mutex");
        }
        this.ownsMutex = true;
        return true;
    }

    wait(timeout = INFINITE) {
        const result = WaitForMultipleObjects(2, this.events, false, timeout);
        if (result !== WAIT_STOP && result !== WAIT_SETTINGS && result !== WAIT_TIMEOUT) {
            throw windowsError("Cannot wait for the Museum events");
        }
        return result;
    }

    requestSettings() {
        if (!SetEvent(this.settings)) throw windowsError("Cannot request Museum settings");
    }

    clearSettingsRequest() {
        if (!ResetEvent(this.settings)) throw windowsError("Cannot clear the Museum settings request");
    }

    stopRequested() {
        const result = WaitForSingleObject(this.stop, 0);
        if (result === 0) return true;
        if (result === WAIT_TIMEOUT) return false;
        throw windowsError("Cannot check the Museum stop event");
    }

    stopOwner() {
        if (this.acquire()) return;
        if (!SetEvent(this.stop)) throw windowsError("Cannot stop the running Museum instance");
        const deadline = Date.now() + 10000;
        do {
            // Closing the modal lets the owner observe the stop event itself.
            const window = findSettingsWindow();
            if (window) PostMessageW(window, WM_CLOSE, 0, 0);
            if (this.acquire(200)) return;
        } while (Date.now() < deadline);
        throw new Error("Museum is still running. Close its settings window and retry removal.");
    }

    close() {
        if (this.ownsMutex) ReleaseMutex(this.mutex);
        if (this.mutex) CloseHandle(this.mutex);
        if (this.settings) CloseHandle(this.settings);
        if (this.stop) CloseHandle(this.stop);
    }
}

function isMuseumWindow(window) {
    const pid = new Uint32Array(1);
    if (!GetWindowThreadProcessId(window, pid)) return false;
    const handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid[0]);
    if (!handle) return false;
    try {
        const path = new Uint16Array(32768);
        const size = new Uint32Array([path.length]);
        return QueryFullProcessImageNameW(handle, 0, path, size) &&
            fromWideString(path).toLowerCase() === process.execPath.toLowerCase();
    } finally {
        CloseHandle(handle);
    }
}

function findSettingsWindow() {
    let window = FindWindowExW(0, 0, "#32770", SETTINGS_TITLE);
    while (window) {
        if (isMuseumWindow(window)) return window;
        window = FindWindowExW(0, window, "#32770", SETTINGS_TITLE);
    }
    return 0;
}

export function showExistingSettings(instance) {
    const window = findSettingsWindow();
    if (window) {
        SetForegroundWindow(window);
        if (IsWindow(window)) return;
    }
    instance.requestSettings();
}

export function installAutostart() {
    const command = `"${process.execPath}" --background`;
    if (command.length > 260) throw new Error("The Museum path is too long for Windows autostart.");
    const out = new Uint8Array(8);
    const opened = RegCreateKeyExW(HKEY_CURRENT_USER, RUN_KEY, 0, 0, 0, KEY_SET_VALUE, 0, out, 0);
    if (opened !== ERROR_SUCCESS) throw new Error(`Cannot open the Windows Run key (${opened}).`);
    const key = readHandle(out);
    try {
        const data = wideString(command);
        const result = RegSetValueExW(key, RUN_VALUE, 0, REG_SZ, data, data.byteLength);
        if (result !== ERROR_SUCCESS) throw new Error(`Cannot register Museum autostart (${result}).`);
    } finally {
        RegCloseKey(key);
    }
}

export function uninstallAutostart() {
    const out = new Uint8Array(8);
    const opened = RegOpenKeyExW(HKEY_CURRENT_USER, RUN_KEY, 0, KEY_SET_VALUE, out);
    if (opened === ERROR_FILE_NOT_FOUND) return;
    if (opened !== ERROR_SUCCESS) throw new Error(`Cannot open the Windows Run key (${opened}).`);
    const key = readHandle(out);
    try {
        const result = RegDeleteValueW(key, RUN_VALUE);
        if (result !== ERROR_SUCCESS && result !== ERROR_FILE_NOT_FOUND) {
            throw new Error(`Cannot remove Museum autostart (${result}).`);
        }
    } finally {
        RegCloseKey(key);
    }
}

export function checkInstance(token) {
    if (!token || !/^[a-zA-Z0-9-]{1,60}$/.test(token)) {
        throw new Error("--instance-check requires a token of 1 to 60 letters, digits or hyphens.");
    }
    const instance = new Instance(`${INSTANCE_NAME}.Check.${token}`);
    try {
        if (!instance.acquire()) {
            instance.requestSettings();
            console.log("Museum check request sent");
            return;
        }
        console.log("Museum check owner ready");
        if (instance.wait(15000) !== WAIT_SETTINGS) {
            throw new Error("No second process signaled the Museum check owner within 15 seconds.");
        }
        console.log("Museum check owner received settings signal");
    } finally {
        instance.close();
    }
}
