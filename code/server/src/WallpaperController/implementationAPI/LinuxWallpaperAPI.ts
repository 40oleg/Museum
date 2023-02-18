import {IHaveWallpaperAPI} from "../IHaveWallpaperAPI";

export class LinuxWallpaperAPI implements IHaveWallpaperAPI {
    constructor() {}
    public getWallpaper(): string {
        return 'empty string';
    }
    public setWallpaper(imagePath: string): void {
    }
}
