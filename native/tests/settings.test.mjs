import { showSettings } from "../settings.mjs";

const saved = showSettings(false, 0, false);
if (!saved || saved.action !== "save" || !saved.enabled || saved.intervalIndex !== 1)
    throw new Error("The settings dialog lost the selected interval or checkbox.");
const cancelled = showSettings(true, 1, true);
if (cancelled !== null) throw new Error("Cancel must discard changes.");
const restored = showSettings(true, 1, true);
if (!restored || restored.action !== "restore") throw new Error("Restore action missing.");
console.log("Settings dialog passed save, cancel and restore.");
