import { Injectable } from '@nestjs/common';
import {interval, Subject, takeUntil, timer} from "rxjs";
import {set} from "wallpaper";
import {ConfigService} from "./config/config.service";
import * as os from 'os';

import * as path from "path";

const fs = require('fs')



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
                    console.log(this.lastConfig, config)
                    if(!this.compareConfigs(this.lastConfig, config)) {
                        this.lastConfig = await this.configService.getConfiguration();
                        await this.runScheduler();
                    }
                });
            })
    }

    private async stopScheduler() {
        console.log('set default')
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
                this.setRandomPainting().then(data => console.log(data)).catch(err => console.log(err));
            });
    }

    private setRandomPainting() {
        console.log('set random painting')
        console.log(__dirname)
        return new Promise((res, rej) => {
            set(path.join(__dirname,`/assets/wallpapers/${Math.floor(Math.random() * 3)}.png`)).then(() => res(null)).catch((err) => console.log(err))
        });
    }

    private setDefaultOSWallpaper() {
        if (fs.existsSync(path.join(__dirname, '/node_modules'))) {
            console.log(path.join(__dirname, '/node_modules'));
            console.log('modules exists')
        } else {
            console.log('modules doesnt exist')
        }

        if (fs.existsSync(path.join(__dirname, '\\\\node_modules\\wallpaper\\\\source\\\\win-wallpaper.exe'))) {
            console.log(path.join(__dirname, '\\\\node_modules\\\\wallpaper\\\\source\\\\win-wallpaper.exe'))
            console.log('exe exists')
        } else {
            console.log('exe doesnt exist')
        }

        if (fs.existsSync(path.join(__dirname, '/assets/standard/windows.jpg'))) {
            console.log(path.join(__dirname, '/assets/standard/windows.jpg'))
            console.log('jpg exists')
        } else {
            console.log('jpg doesnt exist')
        }
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
