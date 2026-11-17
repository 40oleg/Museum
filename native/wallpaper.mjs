import { lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { extname, isAbsolute, join, resolve } from "node:path";
import {
    fromWideString, lastError, MAX_PATH, SPIF_SENDCHANGE, SPIF_UPDATEINIFILE,
    SPI_GETDESKWALLPAPER, SPI_SETDESKWALLPAPER, SystemParametersInfoBufferW, SystemParametersInfoW,
} from "nona:win32";

const backupDirectoryPattern = /^backup-[A-Za-z0-9]{6}$/;
const imageNamePattern = /^previous\.[a-z0-9]{1,10}$/;

function readState(directory) {
    let text;
    try {
        text = readFileSync(join(directory, "state.json"), "utf8");
    } catch (error) {
        if (error.code === "ENOENT") return null;
        throw error;
    }
    const state = JSON.parse(text);
    if (!state || state.version !== 1 || typeof state.pending !== "boolean" ||
        typeof state.originalPath !== "string" || state.originalPath.includes("\0")) {
        throw new Error("Invalid wallpaper backup state");
    }
    if (state.originalPath === "") {
        if (state.image !== null) throw new Error("Invalid empty wallpaper backup state");
    } else if (!isAbsolute(state.originalPath) || !state.image ||
        typeof state.image.directory !== "string" || !backupDirectoryPattern.test(state.image.directory) ||
        typeof state.image.name !== "string" || !imageNamePattern.test(state.image.name) ||
        !Number.isSafeInteger(state.image.size) || state.image.size < 1) {
        throw new Error("Invalid wallpaper backup image reference");
    }
    return state;
}

function persistState(directory, state) {
    const temporary = join(directory, "state.next");
    writeFileSync(temporary, JSON.stringify(state), { mode: 0o600 });
    renameSync(temporary, join(directory, "state.json"));
}

function imageExtension(path, bytes) {
    // Windows can report the extensionless TranscodedWallpaper file.
    if (bytes[0] === 0x42 && bytes[1] === 0x4d) return ".bmp";
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return ".jpg";
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return ".png";
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return ".gif";
    if ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 42 && bytes[3] === 0) ||
        (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0 && bytes[3] === 42)) return ".tif";
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return ".webp";
    const extension = extname(path).toLowerCase();
    if (/^\.[a-z0-9]{1,10}$/.test(extension)) return extension;
    throw new Error("Cannot identify the previous wallpaper image format");
}

function backupPath(directory, image) {
    if (!image) return "";
    const path = join(directory, image.directory, image.name);
    const info = lstatSync(path);
    if (!info.isFile() || info.size !== image.size) {
        throw new Error("The wallpaper backup image is incomplete");
    }
    return path;
}

function saveBackup(directory, originalPath) {
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const state = { version: 1, pending: true, originalPath, image: null };
    if (originalPath !== "") {
        if (!isAbsolute(originalPath)) throw new Error("Windows returned a relative wallpaper path");
        const bytes = readFileSync(originalPath);
        if (!bytes.length) throw new Error("The previous wallpaper image is empty");
        const name = "previous" + imageExtension(originalPath, bytes);
        const staging = mkdtempSync(join(directory, "backup-"));
        const path = join(staging, name);
        writeFileSync(path, bytes, { flag: "wx", mode: 0o600 });
        state.image = { directory: staging.slice(directory.length + 1), name, size: bytes.length };
        backupPath(directory, state.image);
    }
    // Publish the recovery record only after the complete image exists.
    persistState(directory, state);
    return state;
}

function pruneOldBackups(directory, keep) {
    // A restore already succeeded. Keep the source Windows may still use,
    // and retry cleanup of superseded or interrupted generations on later restores.
    try {
        for (const entry of readdirSync(directory)) {
            if (entry !== keep && backupDirectoryPattern.test(entry)) {
                rmSync(join(directory, entry), { recursive: true, force: true });
            }
        }
    } catch {
        // Failure to remove an obsolete copy does not invalidate the restored wallpaper.
    }
}

export function createWallpaperController(win32) {
    function currentWallpaper() {
        const buffer = new Uint16Array(MAX_PATH);
        if (!win32.get(SPI_GETDESKWALLPAPER, buffer.length, buffer, 0)) {
            const error = win32.errorCode();
            throw new Error(`SPI_GETDESKWALLPAPER failed (Windows error ${error})`);
        }
        if (buffer[MAX_PATH - 1] !== 0) throw new Error("Windows returned an unterminated wallpaper path");
        return fromWideString(buffer);
    }

    function setWallpaper(path) {
        if (!win32.set(SPI_SETDESKWALLPAPER, 0, path, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE)) {
            const error = win32.errorCode();
            throw new Error(`SPI_SETDESKWALLPAPER failed (Windows error ${error})`);
        }
    }

    function applyPainting(imagePath, stateDirectory) {
        const path = resolve(imagePath);
        const image = statSync(path);
        if (!image.isFile() || image.size === 0) throw new Error("The painting must be a nonempty image file");
        const directory = resolve(stateDirectory, "wallpaper");
        let state = readState(directory);
        if (state && state.pending) {
            backupPath(directory, state.image);
        } else {
            const originalPath = currentWallpaper();
            try {
                state = saveBackup(directory, originalPath);
            } catch (error) {
                throw new Error(`Could not back up the previous wallpaper: ${error.message}`);
            }
        }
        // A failed Windows update can still have made changes. Keep recovery pending.
        setWallpaper(path);
        return true;
    }

    function restoreWallpaper(stateDirectory) {
        const directory = resolve(stateDirectory, "wallpaper");
        const state = readState(directory);
        if (!state || !state.pending) return false;
        setWallpaper(backupPath(directory, state.image));
        // If this write fails, the active record remains valid and restore can be retried.
        state.pending = false;
        persistState(directory, state);
        pruneOldBackups(directory, state.image && state.image.directory);
        return true;
    }

    function canRestoreWallpaper(stateDirectory) {
        try {
            const directory = resolve(stateDirectory, "wallpaper");
            const state = readState(directory);
            if (!state || !state.pending) return false;
            backupPath(directory, state.image);
            return true;
        } catch {
            return false;
        }
    }

    return { applyPainting, restoreWallpaper, canRestoreWallpaper };
}

const native = createWallpaperController({
    get: SystemParametersInfoBufferW,
    set: SystemParametersInfoW,
    errorCode: lastError,
});

export const applyPainting = native.applyPainting;
export const restoreWallpaper = native.restoreWallpaper;
export const canRestoreWallpaper = native.canRestoreWallpaper;
