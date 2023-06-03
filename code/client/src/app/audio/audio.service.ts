import { Injectable } from '@angular/core';

enum SoundsEnum {
    Success = 'Success',
    Error = 'Error',
}

const sounds = {
    [SoundsEnum.Success]: './assets/sounds/bell2.wav',
    [SoundsEnum.Error]: './assets/sounds/error.mp3',
};

@Injectable()
export class AudioService {
    private audio = {
        success: new Audio(sounds[SoundsEnum.Success]),
        error: new Audio(sounds[SoundsEnum.Error]),
    };

    constructor() {}

    public playSuccess() {
        this.audio.success
            .play()
            .then()
            .catch((err) => console.log(err));
    }

    public playError() {
        this.audio.error
            .play()
            .then()
            .catch((err) => console.log(err));
    }
}
