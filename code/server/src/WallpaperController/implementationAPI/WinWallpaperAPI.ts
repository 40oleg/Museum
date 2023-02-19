import {execSync} from "node:child_process";
import {IHaveWallpaperAPI} from "../IHaveWallpaperAPI";

export class WinWallpaperAPI implements IHaveWallpaperAPI {
    constructor() {}
    public getWallpaper(): string {
        throw new Error('Not implemented');
        return execSync('reg query "HKEY_CURRENT_USER\\Control Panel\\Desktop" /v Wallpaper').toString();
    }
    public setWallpaper(imagePath: string): void {
        const setCommand = `powershell "C:/Users/enigm/Desktop/Museum/util/ps/setWallpaper.ps1" -imgPath ${imagePath}`;
        execSync(setCommand)
    }
}
