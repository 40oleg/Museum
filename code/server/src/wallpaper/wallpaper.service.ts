import { Injectable } from '@nestjs/common';
import { setWallpaper } from 'wallpaper';

@Injectable()
export class WallpaperService {
    counter = 0;

    constructor() {
        this.restoreUserWallpaper();
    }

    // @ts-ignore
    rememberUserWallpaper(): string {
    }

    // @ts-ignore
    restoreUserWallpaper(): string {
        // console.log(this.wallpaperController.getWallpaper());
        // this.wallpaperController.setWallpaper(`C:/wallpapers/${this.counter}.jpg`);
        setWallpaper(`C:/wallpapers/${this.counter}.jpg`)
    }
}
