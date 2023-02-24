import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {ChangePeriods} from '../../enums/ChangePeriods.enum'
import {TuiAlertService, TuiNotification} from "@taiga-ui/core";
import {AudioService} from "../audio/audio.service";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit {

  public changeIntervals = ChangePeriods;

  public changeIntervalControl = new FormControl(this.changeIntervals[2]);

  constructor(
    private readonly alertService: TuiAlertService,
    private readonly audioService: AudioService,
  ) {}

  ngOnInit(): void {
  }

  saveSettings() {
    this.alertService
      .open('Все настройки успешно сохранены. Приложение может быть закрыто.',
        {status: TuiNotification.Success, label: 'Сохранение'})
      .subscribe();
    this.audioService.playSuccess();
  }
}
