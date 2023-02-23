import { Module } from '@nestjs/common';
import {ConfigService} from "./config.service.js";
import {ConfigController} from "./config.controller.js";

@Module({
    imports: [],
    controllers: [ConfigController],
    providers: [ConfigService],
})
export class ConfigModule {}
