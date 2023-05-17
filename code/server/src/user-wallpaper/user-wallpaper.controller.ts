import {Controller, Post} from '@nestjs/common';
import {UserWallpaperService} from "./user-wallpaper.service";

@Controller('user-wallpaper')
export class UserWallpaperController {
    constructor(private readonly userWallpaperService: UserWallpaperService) {
    }
    @Post('save')
    saveUserWallpaper() {
       this.userWallpaperService.saveUserWallpaper();
    }

    @Post('set')
    setUserWallpaper() {
        this.userWallpaperService.setUserWallpaper();
    }
}
