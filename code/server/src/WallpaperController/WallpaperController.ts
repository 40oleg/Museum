import {IHaveWallpaperAPI} from "./IHaveWallpaperAPI";
import {WinWallpaperAPI} from "./implementationAPI/WinWallpaperAPI";
import {LinuxWallpaperAPI} from "./implementationAPI/LinuxWallpaperAPI";
import * as os from 'os';

export enum MuseumOS {
    'aix' = 'aix',
    'darwin' = 'darwin',
    'freebsd' = 'freebsd',
    'linux' = 'linux',
    'openbsd' = 'openbsd',
    'sunos' = 'sunos',
    'win32' = 'win32',
}

/**
 * This class use as main class to work with wallpapers.
 * Instantiate this class to start working with wallpapers.
 */
export class WallpaperController {
    private operationSystemAPI: IHaveWallpaperAPI;
    constructor() {
        const osName = os.platform();
        if(osName === MuseumOS.win32) {
            this.operationSystemAPI = new WinWallpaperAPI();
            return;
        }
        if(osName === MuseumOS.linux) {
            this.operationSystemAPI = new LinuxWallpaperAPI();
            return;
        }
        throw new Error('Provided unsupported operation system');
    }
    getWallpaper(): string {
        return this.operationSystemAPI.getWallpaper();
    }
    setWallpaper(imagePath: string): void {
        this.operationSystemAPI.setWallpaper(imagePath);
    }
}
