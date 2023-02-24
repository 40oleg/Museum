import {Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ChangePeriods} from '../../enums/ChangePeriods.enum'
import {TuiAlertService, TuiNotification} from "@taiga-ui/core";
import {AudioService} from "../audio/audio.service";
import {ConfigurationApiService} from "../api/configuration-api.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
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
    })
    this.loadConfiguration();
  }

  /**
   * Load full application's configuration  (do not mix up with application's settings)
   */
  private loadConfiguration() {
    this.configurationApiService.getConfig().subscribe((config: any) =>  {
      this.configurationGroup.setValue(config);
    });
  }

  /** Save full application's configurations */
  saveConfiguration() {
    const config = this.configurationGroup.value;
    this.configurationApiService
      .setConfig(config);
    this.alertService
      .open('Все настройки успешно сохранены. Приложение может быть закрыто.',
        {status: TuiNotification.Success, label: 'Сохранение'})
      .subscribe();
    this.audioService.playSuccess();
  }
}
