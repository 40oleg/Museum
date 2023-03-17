import { Module } from '@nestjs/common';
import {ConfigService} from "./config.service";
import {ConfigController} from "./config.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Configuration} from "./config.entity";
import {Interval} from "./interval.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Configuration, Interval])],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
