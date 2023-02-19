import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsComponent } from './settings.component';
import {TuiDataListWrapperModule, TuiIslandModule, TuiSelectModule, TuiToggleModule} from "@taiga-ui/kit";
import {TuiButtonModule, TuiDataListModule, TuiLabelModule} from "@taiga-ui/core";
import {ReactiveFormsModule} from "@angular/forms";



@NgModule({
    declarations: [
        SettingsComponent
    ],
    exports: [
        SettingsComponent
    ],
  imports: [
    CommonModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiToggleModule,
    TuiIslandModule,
    TuiButtonModule,
    TuiLabelModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiDataListModule,
    ReactiveFormsModule,
  ]
})
export class SettingsModule { }