import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Remember original user wallpaper, because we need an opportunity to restore it
   */
  @Get('rememberUserWallpaper')
  rememberUserWallpaper(): string {
    return this.appService.rememberUserWallpaper();
  }

  /**
   * Set original user wallpaper that was saved earlier
   */
  @Get('restoreUserWallpaper')
  restoreUserWallpaper(): string {
    return this.appService.restoreUserWallpaper();
  }
}
