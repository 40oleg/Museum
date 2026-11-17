import { define } from "nona:ffi";
import { wideString } from "nona:win32";

const taskDialog = define("comctl32.dll", "TaskDialogIndirect", "i32(buf,buf,buf,buf)");
const allocate = define("kernel32.dll", "LocalAlloc", "ptr(u32,u64)");
const free = define("kernel32.dll", "LocalFree", "ptr(ptr)");
const copy = define("kernel32.dll", "RtlMoveMemory", "void(ptr,buf,u64)");

const periods = ["Каждый час", "Каждые 3 часа", "Каждый день", "Каждые 3 дня",
    "Каждую неделю", "Каждые 2 недели", "Каждые 28 дней"];
const SAVE = 100;
const RESTORE = 101;
const FIRST_PERIOD = 200;

// Win64 user-mode addresses fit exactly in a JS Number. The SDK packs
// TASKDIALOGCONFIG and TASKDIALOG_BUTTON to one byte, including on x64.
function putPointer(view, offset, address) {
    view.setUint32(offset, address >>> 0, true);
    view.setUint32(offset + 4, Math.floor(address / 4294967296), true);
}

export function showSettings(enabled, intervalIndex, canRestore) {
    const allocations = [];
    function keep(bytes) {
        const address = allocate(0, bytes.byteLength);
        if (!address) throw new Error("Недостаточно памяти для окна настроек.");
        allocations.push(address);
        copy(address, bytes, bytes.byteLength);
        return address;
    }
    function buttons(entries) {
        const bytes = new Uint8Array(entries.length * 12);
        const view = new DataView(bytes.buffer);
        for (let i = 0; i < entries.length; i++) {
            view.setInt32(i * 12, entries[i][0], true);
            putPointer(view, i * 12 + 4, keep(wideString(entries[i][1])));
        }
        return keep(bytes);
    }
    try {
        const config = new Uint8Array(160);
        const view = new DataView(config.buffer);
        view.setUint32(0, config.length, true);
        view.setUint32(20, 8 | (enabled ? 256 : 0), true); // allow cancel, initial checkbox
        view.setUint32(24, 8, true); // system Cancel button
        putPointer(view, 28, keep(wideString("Настройки Museum")));
        putPointer(view, 44, keep(wideString("Как часто менять картину?")));
        const actions = [[SAVE, "Сохранить"]];
        if (canRestore) actions.push([RESTORE, "Вернуть исходные обои"]);
        view.setUint32(60, actions.length, true);
        putPointer(view, 64, buttons(actions));
        view.setInt32(72, SAVE, true);
        view.setUint32(76, periods.length, true);
        putPointer(view, 80, buttons(periods.map((text, i) => [FIRST_PERIOD + i, text])));
        view.setInt32(88, FIRST_PERIOD + intervalIndex, true);
        putPointer(view, 92, keep(wideString("Включить смену картин")));
        const action = new Int32Array(1);
        const period = new Int32Array(1);
        const checked = new Int32Array(1);
        const status = taskDialog(config, action, period, checked);
        if (status !== 0) throw new Error("Не удалось открыть настройки Museum (" + status + ").");
        if (action[0] !== SAVE && action[0] !== RESTORE) return null;
        return { action: action[0] === SAVE ? "save" : "restore",
            enabled: checked[0] !== 0, intervalIndex: period[0] - FIRST_PERIOD };
    } finally {
        for (const address of allocations) free(address);
    }
}
