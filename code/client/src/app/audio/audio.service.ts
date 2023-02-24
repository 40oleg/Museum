import { Injectable } from '@angular/core';

enum SoundsEnum {
  Success = 'Success',
}

const sounds = {
  [SoundsEnum.Success]: './assets/sounds/bell2.wav',
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio(sounds[SoundsEnum.Success]);
  constructor() { }

  public playSuccess() {
    this.audio.play()
      .then()
      .catch((err) => console.log(err));
  }
}
