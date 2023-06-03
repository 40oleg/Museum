import { Injectable } from '@nestjs/common';
import { getWallpaper, setWallpaper } from 'wallpaper';
import fs from 'fs';
import { ConfigService } from '../config/config.service.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

@Injectable()
export class UserWallpaperService {
    constructor(private readonly configService: ConfigService) {}

    async saveUserWallpaper() {
        const userWallpaperPath = await getWallpaper();
        return new Promise((res, rej) => {
            fs.readFile(userWallpaperPath, (err, data) => {
                if (err) {
                    rej(err);
                    return;
                }
                this.configService
                    .getConfiguration()
                    .then((config) => {
                        config.userImage = data.toString('base64');
                        this.configService
                            .saveConfiguration(config)
                            .then(() => {
                                res(true);
                            })
                            .catch((err) => {
                                rej(err);
                            });
                    })
                    .catch((err) => {
                        rej(err);
                    });
            });
        });
    }

    async setUserWallpaper() {
        return new Promise((res, rej) => {
            this.configService.getConfiguration().then((config) => {
                const buffer = Buffer.from(config.userImage, 'base64');
                fs.writeFile('./tmp.jpg', buffer, (err) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    setWallpaper('tmp.jpg')
                        .then(() => {
                            res(true);
                        })
                        .catch((error) => {
                            rej(error);
                        });
                });
            });
        });
    }
}
