import {execSync} from "node:child_process";
import {IHaveWallpaperAPI} from "../IHaveWallpaperAPI";

export class WinWallpaperAPI implements IHaveWallpaperAPI {
    constructor() {}
    public getWallpaper(): string {
        return 'empty string';
    }
    public setWallpaper(imagePath: string): void {
        const setCommand = `powershell "C:/Users/enigm/Desktop/Museum/util/ps/setWallpaper.ps1" -imgPath ${imagePath}`;
        execSync(setCommand)
    }
}
