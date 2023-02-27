import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AudioService} from "./audio.service";

@NgModule({
  declarations: [
  ],
  providers: [AudioService],
  imports: [
    CommonModule,
  ]
})
export class AudioModule { }
