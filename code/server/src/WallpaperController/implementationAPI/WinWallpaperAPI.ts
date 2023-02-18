import {execSync} from "node:child_process";
import {IHaveWallpaperAPI} from "../IHaveWallpaperAPI";

export class WinWallpaperAPI implements IHaveWallpaperAPI {
    constructor() {}
    public getWallpaper(): string {
        return 'empty string';
    }
    public setWallpaper(imagePath: string): void {
        const setCommand = `reg add "HKEY_CURRENT_USER\\Control Panel\\Desktop" /v Wallpaper /t REG_SZ /d  "${imagePath}" /f`;
        const updateSystemCommand = 'RUNDLL32.EXE user32.dll , UpdatePerUserSystemParameters';
        execSync(setCommand, {input: 'Y'})
        for(let i = 0; i < 250; i++) {
            execSync(updateSystemCommand);
        }
    }
}
