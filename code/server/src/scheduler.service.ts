import { Injectable } from '@nestjs/common';
import { filter, Subject, switchMap, timer } from "rxjs";
import { set } from "wallpaper";
import { ConfigService } from "./config/config.service";
import * as path from "path";
import { IConfiguration } from "./interfaces/configuration.interface";
import { Configuration } from "./config/config.entity";
import * as fs from "fs";



@Injectable()
export class SchedulerService {

    private readonly destroyScheduler$: Subject<null>;
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.destroyScheduler$ = new Subject();
        this.configService.getConfiguration().then((config) => {
            if(!config) {
                this.configService.saveConfiguration(new Configuration());
            }
        })
        this.runMonitorWallpaperChangingEnabled(10000);
    }

    private runMonitorWallpaperChangingEnabled(recheckTime: number) {
        timer(500, recheckTime)
            .pipe(
                switchMap(() => this.configService.getConfiguration()),
                filter(config => config?.enabledCarousel),
            )
            .subscribe((config) => {
                if(config.lastChangeTimestamp < Date.now() - config.changeInterval.timestamp) {
                    this.setRandomPainting();
                    this.refreshChangeTime(config);
                }
            })
    }

    private refreshChangeTime(config: IConfiguration) {
        config.lastChangeTimestamp = Date.now();
        this.configService.saveConfiguration(config);
    }

    private setRandomPainting() {
        const wallpapersDirectory = path.join(__dirname,`/assets/wallpapers/`);
        fs.readdir(wallpapersDirectory, (err, files) => {
            if(err) {
                console.log(err)
                return;
            }
            const countWallpapers = files.length;
            const imagePath = path.join(wallpapersDirectory,`${Math.floor(Math.random() * countWallpapers)}.jpg`);
            return new Promise((res, rej) => {
                set(imagePath).then(() => res(null)).catch((err) => console.log(err))
            });
        });
    }
}
