import {Injectable} from '@nestjs/common';
import {WallpaperController} from "./WallpaperController/WallpaperController";

@Injectable()
export class AppService {
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
    console.log(123)
    console.log(this.wallpaperController.getWallpaper());
    console.log(123)
    // this.wallpaperController.setWallpaper(`C:/wallpapers/${this.counter}.jpg`);
  }
}
