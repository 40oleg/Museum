import { Injectable } from '@nestjs/common';
import { filter, interval, Subject, switchMap } from "rxjs";
import { set } from "wallpaper";
import { ConfigService } from "./config/config.service";
import * as os from 'os';
import * as path from "path";



@Injectable()
export class SchedulerService {

    private readonly destroyScheduler$: Subject<null>;
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.destroyScheduler$ = new Subject();
        interval(10000)
            .pipe(
                switchMap(() => this.configService.getConfiguration()),
                filter(el => el?.enabledCarousel),
            )
            .subscribe((config) => {
                if(config.lastChangeTimestamp < Date.now() - config.changeInterval.timestamp) {
                    this.setRandomPainting();
                    config.lastChangeTimestamp = Date.now();
                    this.configService.saveConfiguration(config);
                }
            })
    }

    private setRandomPainting() {
        const imagePath = path.join(__dirname,`/assets/wallpapers/${Math.floor(Math.random() * 3)}.png`);
        return new Promise((res, rej) => {
            set(imagePath).then(() => res(null)).catch((err) => console.log(err))
        });
    }

    private setDefaultOSWallpaper() {
        return new Promise((res, rej) => {
            const osName = os.platform();
            if(osName === 'win32') set(path.join(__dirname, '/assets/standard/windows.jpg')).then(() => res(null)).catch(err => console.log(err))
            if(osName === 'darwin') set('./assets/standard/mac.jpg').then(() => res(null)).catch(err => console.log(err))
            if(osName === 'linux') set('./assets/standard/linux.jpg').then(() => res(null)).catch(err => console.log(err))
        })
    }


    compareConfigs(configA, configB) {
        if (!(configA && configB)) return false;
        return configA.id === configB.id;
    }
}
