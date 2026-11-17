import { copyFileSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import {
    fromWideString, lastError, MAX_PATH, SPIF_SENDCHANGE, SPIF_UPDATEINIFILE,
    SPI_GETDESKWALLPAPER, SPI_SETDESKWALLPAPER, SystemParametersInfoBufferW, SystemParametersInfoW,
} from "nona:win32";
import { applyPainting, canRestoreWallpaper, restoreWallpaper } from "../wallpaper.mjs";

if (process.platform !== "win32" || process.env.GITHUB_ACTIONS !== "true" ||
    process.env.RUNNER_ENVIRONMENT !== "github-hosted" || process.argv.length !== 3 ||
    process.argv[1] !== "--disposable-desktop" || !process.env.RUNNER_TEMP) {
    throw new Error("Run on a disposable GitHub-hosted Windows runner with --disposable-desktop <wallpapers-directory>");
}

function check(condition, message) {
    if (!condition) throw new Error(message);
}

function getWallpaper() {
    const buffer = new Uint16Array(MAX_PATH);
    if (!SystemParametersInfoBufferW(SPI_GETDESKWALLPAPER, buffer.length, buffer, 0)) {
        throw new Error(`SPI_GETDESKWALLPAPER failed (Windows error ${lastError()})`);
    }
    check(buffer[MAX_PATH - 1] === 0, "Windows returned an unterminated wallpaper path");
    return fromWideString(buffer);
}

function setWallpaper(path) {
    if (!SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, path, SPIF_UPDATEINIFILE | SPIF_SENDCHANGE)) {
        throw new Error(`SPI_SETDESKWALLPAPER failed (Windows error ${lastError()})`);
    }
}

function sameBytes(first, second) {
    if (first.length !== second.length) return false;
    for (let i = 0; i < first.length; i++) {
        if (first[i] !== second[i]) return false;
    }
    return true;
}

function isJpeg(bytes) {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function initialImageExtension(path, bytes) {
    if (isJpeg(bytes)) return ".jpg";
    if (bytes[0] === 0x42 && bytes[1] === 0x4d) return ".bmp";
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return ".png";
    const extension = extname(path);
    check(/^\.[a-z0-9]{1,10}$/i.test(extension), "Cannot stage the runner's original wallpaper");
    return extension;
}

function pathStillHasBytes(path, expected) {
    try {
        return sameBytes(readFileSync(path), expected);
    } catch {
        return false;
    }
}

const packageDirectory = resolve(process.argv[2]);
const baselineSource = join(packageDirectory, "0.jpg");
const painting = join(packageDirectory, "1.jpg");
const baselineBytes = readFileSync(baselineSource);
const paintingBytes = readFileSync(painting);
check(isJpeg(baselineBytes) && isJpeg(paintingBytes) && !sameBytes(baselineBytes, paintingBytes),
    "The native wallpaper smoke requires two different packaged JPEGs");

const temp = resolve(process.env.RUNNER_TEMP);
const root = mkdtempSync(join(temp, "Museum-wallpaper-native-"));
let initialPath;
let initialBytes;
let initialDirectory;
let initialCopy;
let touched = false;
let keepInitialCopy = false;
let failure;

try {
    initialPath = getWallpaper();
    if (initialPath) {
        initialBytes = readFileSync(initialPath);
        check(initialBytes.length > 0, "The runner's original wallpaper file is empty");
        const extension = initialImageExtension(initialPath, initialBytes);
        initialDirectory = mkdtempSync(join(temp, "Museum-wallpaper-initial-"));
        initialCopy = join(initialDirectory, "original" + extension);
        writeFileSync(initialCopy, initialBytes, { flag: "wx" });
        check(pathStillHasBytes(initialCopy, initialBytes), "Could not preserve the runner's original wallpaper");
    }

    const baseline = join(root, "disposable-baseline.jpg");
    const state = join(root, "state");
    copyFileSync(baselineSource, baseline);
    touched = true;
    setWallpaper(baseline);
    check(pathStillHasBytes(getWallpaper(), baselineBytes), "Windows did not report the disposable baseline JPEG");

    check(applyPainting(painting, state), "Museum did not apply the packaged painting");
    check(pathStillHasBytes(getWallpaper(), paintingBytes), "Windows did not report the applied painting JPEG");
    check(canRestoreWallpaper(state), "Museum did not save the disposable baseline");

    unlinkSync(baseline);
    check(restoreWallpaper(state), "Museum could not restore after the baseline file was removed");
    const restoredPath = getWallpaper();
    check(restoredPath && restoredPath.toLowerCase() !== baseline.toLowerCase() &&
        pathStillHasBytes(restoredPath, baselineBytes), "Windows did not report the saved baseline JPEG after restore");
    check(!canRestoreWallpaper(state), "Museum did not finish the restore cycle");
} catch (error) {
    failure = error;
} finally {
    try {
        if (touched) {
            if (!initialPath) {
                setWallpaper("");
                check(getWallpaper() === "", "The runner's initially empty wallpaper could not be restored");
            } else {
                let restoredOriginal = false;
                if (pathStillHasBytes(initialPath, initialBytes)) {
                    try {
                        setWallpaper(initialPath);
                        restoredOriginal = pathStillHasBytes(getWallpaper(), initialBytes);
                    } catch {
                        // Try the independent file if the original path no longer works.
                    }
                }
                if (!restoredOriginal) {
                    keepInitialCopy = true;
                    setWallpaper(initialCopy);
                    check(pathStillHasBytes(getWallpaper(), initialBytes), "The runner's original wallpaper could not be restored");
                }
            }
        }
        rmSync(root, { recursive: true });
        if (initialDirectory && !keepInitialCopy) rmSync(initialDirectory, { recursive: true });
    } catch (cleanupError) {
        if (failure) console.error(`Wallpaper smoke failed: ${failure.message}`);
        throw cleanupError;
    }
}

if (failure) throw failure;
console.log("Native wallpaper smoke applied a packaged painting, restored the deleted baseline, and restored the runner desktop");
