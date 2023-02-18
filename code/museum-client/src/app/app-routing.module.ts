import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FormSettingsComponent} from "./form-settings/form-settings.component";

const routes: Routes = [{
  path: '**',
  component: FormSettingsComponent,
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
