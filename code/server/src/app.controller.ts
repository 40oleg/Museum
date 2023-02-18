import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Запомнить обои пользователя, чтобы потом иметь возможность их восстановить
   */
  @Get('rememberUserWallpaper')
  rememberUserWallpaper(): string {
    return this.appService.rememberUserWallpaper();
  }

  /**
   * Установить изначальные обои пользователя, которые ранее были созранены
   */
  @Get('restoreUserWallpaper')
  restoreUserWallpaper(): string {
    return this.appService.restoreUserWallpaper();
  }
}
