import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
    ChangePeriods,
    ChangePeriodsEnum,
} from '../../enums/ChangePeriods.enum';
import { TuiAlertService, TuiNotification } from '@taiga-ui/core';
import { AudioService } from '../audio/audio.service';
import { ConfigurationApiService } from '../api/configuration-api.service';
import { catchError, Observable } from 'rxjs';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.less'],
})
export class SettingsComponent {
    /**
     * Time intervals which users can use to change wallpapers
     */
    public changeIntervals = ChangePeriods;

    /**
     * Form Group for configuration
     */
    public configurationGroup: FormGroup;

    constructor(
        private readonly configurationApiService: ConfigurationApiService,
        private readonly alertService: TuiAlertService,
        private readonly audioService: AudioService,
    ) {
        this.configurationGroup = new FormGroup({
            changeInterval: new FormControl(this.changeIntervals[0]),
            enabledCarousel: new FormControl(false),
        });
        this.loadConfiguration();
    }

    /**
     * Load full application's configuration  (do not mix up with application's settings)
     */
    private loadConfiguration() {
        this.configurationApiService.getConfig().subscribe((config: any) => {
            console.log(config);
            this.configurationGroup.patchValue(config);
        });
    }

    /** Save full application's configurations */
    saveConfiguration() {
        const config = this.configurationGroup.value;
        this.configurationApiService
            .saveConfig(config)
            .pipe(
                catchError((error) => {
                    return new Observable(() => {
                        this.alertService
                            .open(
                                'Настройки не сохранены. Пожалусйта, попробуйте еще раз.',
                                {
                                    status: TuiNotification.Error,
                                    label: 'Ошибка',
                                },
                            )
                            .subscribe();
                        this.audioService.playError();
                    });
                }),
            )
            .subscribe(() => {
                this.alertService
                    .open(
                        'Все настройки успешно сохранены. Приложение может быть закрыто.',
                        {
                            status: TuiNotification.Success,
                            label: 'Сохранение',
                        },
                    )
                    .subscribe();
                this.audioService.playSuccess();
            });
    }

    getUiName(item: any): string {
        if (item.name === ChangePeriodsEnum.EVERY_15_SECONDS)
            return 'Каждые 15 секунд (debug)';
        if (item.name === ChangePeriodsEnum.EVERY_MINUTE)
            return 'Каждую минуту (debug)';
        if (item.name === ChangePeriodsEnum.EVERY_HOUR) return 'Каждый час';
        if (item.name === ChangePeriodsEnum.EVERY_3_HOURS)
            return 'Каждые 3 часа';
        if (item.name === ChangePeriodsEnum.EVERY_DAY) return 'Каждый день';
        if (item.name === ChangePeriodsEnum.EVERY_3_DAY) return 'Каждые 3 дня';
        if (item.name === ChangePeriodsEnum.EVERY_WEEK) return 'Каждую неделю';
        if (item.name === ChangePeriodsEnum.EVERY_2_WEEK)
            return 'Каждые 2 недели';
        if (item.name === ChangePeriodsEnum.EVERY_MONTH) return 'Каждый месяц';
        return 'EMPTY';
    }
}
