import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-settings',
  templateUrl: './form-settings.component.html',
  styleUrls: ['./form-settings.component.less']
})
export class FormSettingsComponent implements OnInit {

  items = ['Раз в час', 'Раз в 3 часа', 'Раз в день', 'Раз в 3 дня', 'Раз в неделю']

  testValue = new FormControl([this.items[2]]);

  constructor() { }

  ngOnInit(): void {
  }

}
