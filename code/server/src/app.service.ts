import {Injectable} from '@nestjs/common';
import {WallpaperController} from "./WallpaperController/WallpaperController";
import internal from "stream";
import {interval, takeUntil, timer} from "rxjs";

@Injectable()
export class AppService {
  counter = 0;
  wallpaperController: WallpaperController;

  constructor() {
    this.wallpaperController = new WallpaperController();
    interval(5000).subscribe(() => {
      this.counter++;
      this.restoreUserWallpaper();
    })
    this.restoreUserWallpaper();
  }

  // @ts-ignore
  rememberUserWallpaper(): string {
  }

  // @ts-ignore
  restoreUserWallpaper(): string {
    console.log(this.counter);
    this.wallpaperController.setWallpaper(`C:/wallpapers/${this.counter}.jpg`);
  }
}
