import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {ConfigModule} from "./config/config.module";
import { WallpaperModule } from './wallpaper/wallpaper.module';

@Module({
  imports: [ConfigModule, WallpaperModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
