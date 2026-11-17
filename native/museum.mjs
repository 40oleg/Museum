import {
    mkdirSync,
    readFileSync,
    readdirSync,
    renameSync,
    statSync,
    writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { MB_ICONERROR, MessageBoxW } from "nona:win32";
import {
    Instance,
    WAIT_SETTINGS,
    WAIT_STOP,
    checkInstance,
    installAutostart,
    showExistingSettings,
    uninstallAutostart,
} from "./lifecycle.mjs";
import { showSettings } from "./settings.mjs";
import { applyPainting, canRestoreWallpaper, restoreWallpaper } from "./wallpaper.mjs";

const HOUR = 3600000;
const INTERVALS = [1, 3, 24, 72, 168, 336, 672].map((hours) => hours * HOUR);
const MAX_WAIT = 60000;
const RETRY_DELAY = 60000;
const CATALOG_SIZE = 151;
const IMAGE_NAME = /^\d+\.jpg$/;
const wallpapers = join(dirname(process.execPath), "wallpapers");

function loadCatalog() {
    const catalog = JSON.parse(readFileSync(join(wallpapers, "catalog.json"), "utf8"));
    if (!Array.isArray(catalog) || catalog.length !== CATALOG_SIZE) {
        throw new Error(`Museum requires its full catalog of ${CATALOG_SIZE} paintings.`);
    }
    const files = new Set();
    for (const painting of catalog) {
        if (!painting || typeof painting.file !== "string" || !IMAGE_NAME.test(painting.file) ||
            files.has(painting.file) || !validText(painting.name) ||
            !validText(painting.author) || !validText(painting.years)) {
            throw new Error("The Museum catalog has an invalid entry or a duplicate image.");
        }
        files.add(painting.file);
    }
    return catalog;
}

function validText(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function checkImage(path) {
    const stats = statSync(path);
    if (!stats.isFile() || stats.size < 5) throw new Error(`Invalid Museum image: ${path}`);
    const bytes = readFileSync(path);
    if (bytes.length !== stats.size || bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255 ||
        bytes[bytes.length - 2] !== 255 || bytes[bytes.length - 1] !== 217) {
        throw new Error(`Invalid JPEG markers in Museum image: ${path}`);
    }
}

function checkPackage() {
    const catalog = loadCatalog();
    const files = readdirSync(wallpapers).filter((name) => /\.jpg$/i.test(name));
    if (files.length !== catalog.length) {
        throw new Error("The Museum package JPEG count differs from its catalog.");
    }
    for (const painting of catalog) checkImage(join(wallpapers, painting.file));
    console.log(`Museum catalog verified: ${catalog.length} images`);
}

function validInterval(index) {
    return Number.isInteger(index) && index >= 0 && index < INTERVALS.length;
}

function loadState(path) {
    let text;
    try {
        text = readFileSync(path, "utf8");
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
        return { enabled: false, intervalIndex: 0, lastFile: "", lastChangedAt: 0, lastRotationError: "" };
    }
    const state = JSON.parse(text);
    if (!state || typeof state.enabled !== "boolean" || !validInterval(state.intervalIndex)) {
        throw new Error("The saved Museum settings are invalid.");
    }
    return {
        enabled: state.enabled,
        intervalIndex: state.intervalIndex,
        lastFile: typeof state.lastFile === "string" ? state.lastFile : "",
        lastChangedAt: Number.isFinite(state.lastChangedAt) && state.lastChangedAt > 0
            ? Math.min(state.lastChangedAt, Date.now())
            : 0,
        lastRotationError: typeof state.lastRotationError === "string" ? state.lastRotationError : "",
    };
}

function saveState(path, state) {
    const pending = `${path}.tmp`;
    writeFileSync(pending, JSON.stringify(state) + "\n", "utf8");
    renameSync(pending, path);
}

function showError(error, title = "Museum") {
    MessageBoxW(0, error.message || String(error), title, MB_ICONERROR);
}

function runWorker(instance, interactive) {
    if (instance.stopRequested()) return;
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) throw new Error("Windows did not provide LOCALAPPDATA.");
    const stateDirectory = join(localAppData, "Museum");
    const statePath = join(stateDirectory, "settings.json");
    const catalog = loadCatalog();
    const state = loadState(statePath);
    mkdirSync(stateDirectory, { recursive: true });
    const firstPainting = Math.floor(Math.random() * catalog.length);
    const settingsTitle = "Настройки Museum";
    let retryAt = 0;
    let event = interactive ? WAIT_SETTINGS : instance.wait(0);

    for (;;) {
        if (event === WAIT_STOP) return;
        let reportFailureNow = false;
        if (event === WAIT_SETTINGS) {
            if (instance.stopRequested()) return;
            // The dialog satisfies already pending settings requests. Do not
            // reset the event after it closes, when it could be a new request.
            instance.clearSettingsRequest();
            if (state.lastRotationError) {
                showError(state.lastRotationError, settingsTitle);
                if (instance.stopRequested()) return;
            }
            const result = showSettings(state.enabled, state.intervalIndex, canRestoreWallpaper(stateDirectory));
            if (instance.stopRequested()) return;
            if (result && result.action === "restore") {
                try {
                    if (restoreWallpaper(stateDirectory)) {
                        state.enabled = false;
                        state.lastFile = "";
                        state.lastChangedAt = 0;
                        state.lastRotationError = "";
                        saveState(statePath, state);
                    }
                } catch (error) {
                    showError(error, settingsTitle);
                }
            } else if (result && result.action === "save") {
                reportFailureNow = !state.enabled && result.enabled;
                state.enabled = result.enabled;
                state.intervalIndex = result.intervalIndex;
                saveState(statePath, state);
                retryAt = 0;
            }
        }

        if (!state.enabled) {
            event = instance.wait();
            continue;
        }

        const now = Date.now();
        const interval = INTERVALS[state.intervalIndex];
        if (state.lastChangedAt > now) state.lastChangedAt = now;
        if (retryAt > now + RETRY_DELAY) retryAt = now + RETRY_DELAY;
        const remaining = Math.max(state.lastChangedAt + interval, retryAt) - now;
        if (remaining > 0) {
            // Recheck wall time after a bounded sleep. A long interval, system
            // suspension, or clock change can make a single timer inaccurate.
            event = instance.wait(Math.min(remaining, MAX_WAIT));
            continue;
        }
        if (instance.stopRequested()) return;
        const previous = catalog.findIndex((painting) => painting.file === state.lastFile);
        const next = previous < 0 ? firstPainting : (previous + 1) % catalog.length;
        const file = catalog[next].file;
        try {
            applyPainting(join(wallpapers, file), stateDirectory);
        } catch (error) {
            const message = `Museum could not apply ${file}: ${error.message || error}`;
            console.error(message);
            if (state.lastRotationError !== message) {
                state.lastRotationError = message;
                saveState(statePath, state);
            }
            if (reportFailureNow) {
                if (instance.stopRequested()) return;
                showError(message, settingsTitle);
            }
            retryAt = Date.now() + RETRY_DELAY;
            event = instance.wait(0);
            continue;
        }
        state.lastFile = file;
        state.lastChangedAt = Date.now();
        state.lastRotationError = "";
        retryAt = 0;
        saveState(statePath, state);
        event = instance.wait(0);
    }
}

function main() {
    const mode = process.argv[1];
    if (mode === "--instance-check" && process.argv.length === 3) {
        checkInstance(process.argv[2]);
        return;
    }
    if (process.argv.length > 2) throw new Error("Museum accepts only one mode at a time.");
    if (mode === "--check") {
        checkPackage();
        return;
    }
    if (mode === "--install") {
        loadCatalog();
        installAutostart();
        return;
    }
    if (mode !== undefined && mode !== "--background" && mode !== "--uninstall") {
        throw new Error("Usage: Museum.exe [--background | --install | --uninstall | --check]");
    }

    const instance = new Instance();
    try {
        if (mode === "--uninstall") {
            uninstallAutostart();
            instance.stopOwner();
        } else if (instance.acquire()) {
            runWorker(instance, mode === undefined);
        } else if (mode === undefined) {
            showExistingSettings(instance);
        }
    } finally {
        instance.close();
    }
}

try {
    main();
} catch (error) {
    console.error(`Museum: ${error.message || error}`);
    if (process.argv[1] === undefined) showError(error);
    process.exit(1);
}
