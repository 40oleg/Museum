import { Injectable } from '@nestjs/common';

(async () => {
    const wallpaper = await import('wallpaper');
    wallpaper.setWallpaper(`C:/wallpapers/2.jpg`)
})();

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
        // setWallpaper(`C:/wallpapers/${this.counter}.jpg`)
    }
}
