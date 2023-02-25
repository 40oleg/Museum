import { Injectable } from '@nestjs/common';
import {interval, Subject, takeUntil, timer} from "rxjs";
import {setWallpaper} from "wallpaper";
import {ConfigService} from "./config/config.service.js";

@Injectable()
export class SchedulerService {

    private readonly destroyScheduler$: Subject<null>;
    private lastConfig;
    constructor(
        private readonly configService: ConfigService,
    ) {
        this.destroyScheduler$ = new Subject();
        this.configService.getConfiguration()
            .then(config => {
                this.lastConfig = config;
                this.runScheduler();
                interval(15000).subscribe(async () => {
                    const config = await this.configService.getConfiguration();
                    if(!this.compareConfigs(this.lastConfig, config)) {
                        this.lastConfig = await this.configService.getConfiguration();
                        this.runScheduler();
                    }
                });
            })
    }

    private stopScheduler() {
        this.destroyScheduler$.next(null);
    }

    private async runScheduler() {
        if(!this.lastConfig.enabledCarousel){
            this.stopScheduler();
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
        setWallpaper(`./wallpapers/${Math.floor(Math.random()*3)}.png`)
    }


    compareConfigs(configA, configB) {
        return configA.id === configB.id;
    }
}
