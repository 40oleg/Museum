import { Module } from '@nestjs/common';
import { WallpaperController } from './wallpaper.controller.js';
import {WallpaperService} from "./wallpaper.service.js";

@Module({
  imports: [],
  controllers: [WallpaperController],
  providers: [WallpaperService],
})
export class WallpaperModule {}
