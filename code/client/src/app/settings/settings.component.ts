import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {ChangePeriodsNames} from "../enums/ChangePeriods.enum";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent implements OnInit {

  public changeIntervals = ChangePeriodsNames;

  public testValue = new FormControl(this.changeIntervals[2]);

  constructor() { }

  ngOnInit(): void {
  }

}
