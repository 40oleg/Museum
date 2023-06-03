import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import {
    TuiRootModule,
    TuiDialogModule,
    TuiAlertModule,
    TUI_SANITIZER,
    TuiThemeNightModule,
    TuiModeModule,
} from '@taiga-ui/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { SettingsModule } from './settings/settings.module';
import { HttpClientModule } from '@angular/common/http';
import { PaintingFrameComponent } from './painting-frame/painting-frame.component';
import { TuiIslandModule } from '@taiga-ui/kit';

@NgModule({
    declarations: [AppComponent, PaintingFrameComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        TuiRootModule,
        TuiDialogModule,
        TuiAlertModule,
        TuiThemeNightModule,
        TuiModeModule,
        SettingsModule,
        HttpClientModule,
        TuiIslandModule,
    ],
    providers: [{ provide: TUI_SANITIZER, useClass: NgDompurifySanitizer }],
    bootstrap: [AppComponent],
})
export class AppModule {}
