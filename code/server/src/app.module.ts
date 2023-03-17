import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import {ConfigModule} from './config/config.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Configuration} from './config/config.entity';
import {Interval} from './config/interval.entity';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './museum_db',
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
