import { Injectable } from '@angular/core';

/** Sounds types */
enum SoundsEnum {
    Success = 'Success',
    Error = 'Error',
}

/** List of sounds */
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

    /** Play success sound */
    public playSuccess() {
        this.audio.success
            .play()
            .then()
            .catch((err) => console.log(err));
    }

    /** Play error sound */
    public playError() {
        this.audio.error
            .play()
            .then()
            .catch((err) => console.log(err));
    }
}
