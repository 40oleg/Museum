import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import {ConfigModule} from "./config/config.module.js";
import { WallpaperModule } from './wallpaper/wallpaper.module.js';

@Module({
  imports: [ConfigModule, WallpaperModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
