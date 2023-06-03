import { Module } from '@nestjs/common';
import { ConfigService } from './config.service.js';
import { ConfigController } from './config.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuration } from './config.entity.js';
import { Interval } from './interval.entity.js';

@Module({
    imports: [TypeOrmModule.forFeature([Configuration, Interval])],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule {}
