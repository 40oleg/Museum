import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import {ConfigModule} from './config/config.module.js';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Configuration} from './config/config.entity.js';
import {Interval} from './config/interval.entity.js';
import { SchedulerService } from './scheduler.service.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: '../../db/sqlite/museum',
      synchronize: true,
      entities: [
        Configuration,
        Interval,
      ],
    }),
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [SchedulerService],
})
export class AppModule {}
