import { Injectable } from '@nestjs/common';
import {WallpaperController} from "../WallpaperAdapter/WallpaperController";

@Injectable()
export class WallpaperService {
    counter = 0;
    wallpaperController: WallpaperController;

    constructor() {
        this.wallpaperController = new WallpaperController();
        this.restoreUserWallpaper();
    }

    // @ts-ignore
    rememberUserWallpaper(): string {
    }

    // @ts-ignore
    restoreUserWallpaper(): string {
        // console.log(this.wallpaperController.getWallpaper());
        // this.wallpaperController.setWallpaper(`C:/wallpapers/${this.counter}.jpg`);
    }
}
