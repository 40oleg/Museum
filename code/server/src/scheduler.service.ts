import { Injectable } from '@nestjs/common';
import {interval, Subject, takeUntil, timer} from "rxjs";
import {setWallpaper} from "wallpaper";
import {ConfigService} from "./config/config.service.js";
import os from 'os';

@Injectable()
export class SchedulerService {

    private readonly destroyScheduler$: Subject<null>;
    private lastConfig;
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.destroyScheduler$ = new Subject();
        this.configService.getConfiguration()
            .then(async (config) => {
                this.lastConfig = config;
                await this.runScheduler();
                interval(15000).subscribe(async () => {
                    const config = await this.configService.getConfiguration();
                    if(!this.compareConfigs(this.lastConfig, config)) {
                        this.lastConfig = await this.configService.getConfiguration();
                        await this.runScheduler();
                    }
                });
            })
    }

    private async stopScheduler() {
        await this.setDefaultOSWallpaper();
        this.destroyScheduler$.next(null);
    }

    private async runScheduler() {
        if(!this.lastConfig?.enabledCarousel){
            await this.stopScheduler();
            return;
        }
        const repeatTime = this.lastConfig.changeInterval.timestamp;
        timer(0, repeatTime)
            .pipe(
                takeUntil(this.destroyScheduler$)
            )
            .subscribe(() => {
                this.setRandomPainting();
            });
    }

    private setRandomPainting() {
        return new Promise((res, rej) => {
            setWallpaper(`./assets/wallpapers/${Math.floor(Math.random() * 3)}.png`).then(() => res(null))
        });
    }

    private setDefaultOSWallpaper() {
        return new Promise((res, rej) => {
            const osName = os.platform();
            if(osName === 'win32') setWallpaper('./assets/standard/windows.jpg').then(() => res(null))
            if(osName === 'darwin') setWallpaper('./assets/standard/mac.jpg').then(() => res(null))
            if(osName === 'linux') setWallpaper('./assets/standard/linux.jpg').then(() => res(null))
        })
    }


    compareConfigs(configA, configB) {
        return configA.id === configB.id;
    }
}
