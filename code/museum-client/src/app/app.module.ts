import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import {
  TuiRootModule,
  TuiDialogModule,
  TuiAlertModule,
  TUI_SANITIZER,
  TuiThemeNightModule,
  TuiModeModule, TuiLabelModule, TuiTextfieldControllerModule, TuiTooltipModule, TuiButtonModule
} from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  TuiCarouselModule,
  TuiComboBoxModule, TuiDataListWrapperModule,
  TuiInputModule,
  TuiIslandModule,
  TuiPaginationModule, TuiSelectModule, TuiToggleModule
} from "@taiga-ui/kit";
import { FormSettingsComponent } from './form-settings/form-settings.component';
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    AppComponent,
    FormSettingsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule,
    TuiThemeNightModule,
    TuiButtonModule,
    TuiIslandModule,
    TuiTextfieldControllerModule,
    TuiLabelModule,
    TuiInputModule,
    TuiTooltipModule,
    TuiCarouselModule,
    TuiPaginationModule,
    TuiComboBoxModule,
    ReactiveFormsModule,
    TuiDataListWrapperModule,
    TuiSelectModule,
    TuiToggleModule,
  ],
  providers: [{provide: TUI_SANITIZER, useClass: NgDompurifySanitizer}],
  bootstrap: [AppComponent]
})
export class AppModule { }
