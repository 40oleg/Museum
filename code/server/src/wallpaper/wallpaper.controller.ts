import {Controller, Get} from '@nestjs/common';
import {WallpaperService} from "./wallpaper.service.js";

@Controller('wallpaper')
export class WallpaperController {
    constructor(private readonly wallpaperService: WallpaperService) {}
    /**
     * Remember original user wallpaper, because we need an opportunity to restore it
     */
    @Get('rememberUserWallpaper')
    rememberUserWallpaper(): string {
        return this.wallpaperService.rememberUserWallpaper();
    }

    /**
     * Set original user wallpaper that was saved earlier
     */
    @Get('restoreUserWallpaper')
    restoreUserWallpaper(): string {
        return this.wallpaperService.restoreUserWallpaper();
    }
}
