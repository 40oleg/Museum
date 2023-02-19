import {IHaveWallpaperAPI} from "../IHaveWallpaperAPI";

/**
 * Implementation wallpaper interface for Linux OS.
 */
export class LinuxWallpaperAPI implements IHaveWallpaperAPI {
    constructor() {}
    public getWallpaper(): string {
        return 'empty string';
    }
    public setWallpaper(imagePath: string): void {
    }
}
