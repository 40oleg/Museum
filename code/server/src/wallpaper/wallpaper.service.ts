import { Injectable } from '@nestjs/common';
import { setWallpaper } from 'wallpaper';
import {interval, Subject, takeUntil} from "rxjs";
import {ChangePeriod, ChangePeriods} from "../enums/ChangePeriods.enum.js";

@Injectable()
export class WallpaperService {
    counter = 0;
    private destroyScheduler: Subject<void>;

    constructor() {
        this.restoreUserWallpaper();
        this.destroyScheduler = new Subject<void>();
        this.changeWallpaperEvery(ChangePeriods[1]);
    }

    // @ts-ignore
    rememberUserWallpaper(): string {
    }

    // @ts-ignore
    restoreUserWallpaper(): string {
    }

    changeWallpaperEvery(period: ChangePeriod) {
        interval(period.timestamp)
            .pipe(
                takeUntil(this.destroyScheduler),
            )
            .subscribe(() => {
            setWallpaper(`C:/wallpapers/${Math.floor(Math.random()*30)}.jpg`)
        })
    }

    private destroyAllScheduler() {
        this.destroyScheduler.next();
    }
}
