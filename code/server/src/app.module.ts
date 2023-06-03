import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ConfigModule } from './config/config.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './config/config.entity.js';
import { Interval } from './config/interval.entity.js';
import { SchedulerService } from './scheduler.service.js';
import { UserWallpaperController } from './user-wallpaper/user-wallpaper.controller.js';
import { UserWallpaperService } from './user-wallpaper/user-wallpaper.service.js';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: './museum_db',
            synchronize: true,
            entities: [Configuration, Interval],
        }),
        ConfigModule,
    ],
    controllers: [AppController, UserWallpaperController],
    providers: [SchedulerService, UserWallpaperService],
})
export class AppModule {}
