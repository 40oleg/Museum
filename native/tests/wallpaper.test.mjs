import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { createWallpaperController } from "../wallpaper.mjs";

function check(condition, message) {
    if (!condition) throw new Error(message);
}

function fails(operation, expectedText) {
    try {
        operation();
    } catch (error) {
        check(error.message.includes(expectedText), `Unexpected error: ${error.message}`);
        return;
    }
    throw new Error(`Expected failure: ${expectedText}`);
}

const bmp = new Uint8Array([66, 77, 0, 255, 0, 129]);
const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 255, 0]);
const jpeg = new Uint8Array([255, 216, 255, 0, 129, 0]);
const root = mkdtempSync(join(process.env.TEMP, "Museum-wallpaper-test-"));

function fixture(name, originalName, originalBytes) {
    const state = join(root, name);
    const original = originalName ? join(root, originalName) : "";
    if (originalBytes) writeFileSync(original, originalBytes);
    const desktop = { current: original, failGet: false, failSet: false, sets: 0 };
    const win32 = {
        get(action, size, buffer, flags) {
            check(action === 0x73 && size === buffer.length && flags === 0,
                "Incorrect Win32 wallpaper query");
            if (desktop.failGet) return false;
            for (let i = 0; i < desktop.current.length; i++) {
                buffer[i] = desktop.current.charCodeAt(i);
            }
            return true;
        },
        set(action, size, path, flags) {
            check(action === 0x14 && size === 0 && flags === 3,
                "Incorrect Win32 wallpaper update");
            desktop.sets++;
            if (desktop.failSet) return false;
            check(path === "" || existsSync(path), "Wallpaper source must exist at apply time");
            desktop.current = path;
            return true;
        },
        errorCode() { return 5; },
    };
    return { state, original, desktop, controller: () => createWallpaperController(win32) };
}

try {
    const first = join(root, "painting-one.jpg");
    const second = join(root, "painting-two.png");
    writeFileSync(first, jpeg);
    writeFileSync(second, png);

    const cycle = fixture("cycle", "Изначальные обои.jpg", bmp);
    let wallpaper = cycle.controller();
    check(!wallpaper.canRestoreWallpaper(cycle.state), "A fresh directory has no recovery snapshot");
    check(!wallpaper.restoreWallpaper(cycle.state), "Restoring before the first apply should be a no-op");
    check(wallpaper.applyPainting(first, cycle.state), "The first painting should apply");
    check(cycle.desktop.current === first, "The first painting should be active");
    unlinkSync(cycle.original);
    wallpaper = cycle.controller();
    check(wallpaper.canRestoreWallpaper(cycle.state), "A fresh controller should find the persisted snapshot");
    check(wallpaper.applyPainting(second, cycle.state), "The next painting should reuse the snapshot");
    check(cycle.desktop.current === second, "The second painting should be active");
    check(wallpaper.restoreWallpaper(cycle.state), "Restore should succeed after the original was removed");
    const restored = cycle.desktop.current;
    check(extname(restored) === ".bmp", "The backup extension should reflect the image bytes");
    check(readFileSync(restored).join(",") === "66,77,0,255,0,129", "The restored copy should retain every byte");
    check(!wallpaper.canRestoreWallpaper(cycle.state), "A successful restore should end the cycle");

    cycle.desktop.current = join(root, "TranscodedWallpaper");
    writeFileSync(cycle.desktop.current, jpeg);
    wallpaper.applyPainting(first, cycle.state);
    wallpaper.restoreWallpaper(cycle.state);
    check(extname(cycle.desktop.current) === ".jpg", "A new cycle should save the new extensionless baseline");
    check(readFileSync(cycle.desktop.current).join(",") === "255,216,255,0,129,0", "Restore used an older baseline");
    check(!existsSync(restored), "A superseded copy can be removed once a new restore succeeds");

    const empty = fixture("empty", "", null);
    wallpaper = empty.controller();
    wallpaper.applyPainting(first, empty.state);
    check(wallpaper.canRestoreWallpaper(empty.state), "No wallpaper is a valid baseline");
    wallpaper.restoreWallpaper(empty.state);
    check(empty.desktop.current === "", "Restore should clear a previously empty desktop wallpaper");

    const refusal = fixture("refusal", "refusal.png", png);
    wallpaper = refusal.controller();
    refusal.desktop.failGet = true;
    fails(() => wallpaper.applyPainting(first, refusal.state), "SPI_GETDESKWALLPAPER");
    check(refusal.desktop.sets === 0, "A failed wallpaper query must prevent changes");
    check(!wallpaper.canRestoreWallpaper(refusal.state), "A failed read must not create a snapshot");
    refusal.desktop.failGet = false;
    refusal.desktop.current = join(root, "missing.png");
    fails(() => wallpaper.applyPainting(first, refusal.state), "back up");
    check(refusal.desktop.sets === 0, "An unreadable original must prevent changes");
    refusal.desktop.current = refusal.original;
    refusal.desktop.failSet = true;
    fails(() => wallpaper.applyPainting(first, refusal.state), "SPI_SETDESKWALLPAPER");
    wallpaper = refusal.controller();
    check(wallpaper.canRestoreWallpaper(refusal.state), "A failed first apply must preserve the backup");
    refusal.desktop.failSet = false;
    wallpaper.applyPainting(first, refusal.state);
    refusal.desktop.failSet = true;
    fails(() => wallpaper.restoreWallpaper(refusal.state), "SPI_SETDESKWALLPAPER");
    wallpaper = refusal.controller();
    check(wallpaper.canRestoreWallpaper(refusal.state), "A failed restore must preserve the backup");
    refusal.desktop.failSet = false;
    wallpaper.restoreWallpaper(refusal.state);
    check(readFileSync(refusal.desktop.current).join(",") === "137,80,78,71,13,10,26,10,255,0",
        "The retried restore should retain the previous wallpaper bytes");
    check(!wallpaper.canRestoreWallpaper(refusal.state), "The retried restore should end the cycle");

    console.log("Wallpaper regression passed with an isolated directory and a simulated desktop");
} finally {
    rmSync(root, { recursive: true });
}
