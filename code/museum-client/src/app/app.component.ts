import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'museum-client';
  items = [
    'John Cleese',
    'Eric Idle',
    'Michael Palin',
    'Graham Chapman',
    'Terry Gilliam',
    'Terry Jones',
  ];
  index = 2;
}
