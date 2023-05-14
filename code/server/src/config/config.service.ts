import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { Repository} from "typeorm";
import {Configuration} from "./config.entity";
import {Interval} from "./interval.entity";
import {IConfiguration} from "../interfaces/configuration.interface";

@Injectable()
export class ConfigService {
    constructor(
        @InjectRepository(Configuration)
        private readonly configurationRepository: Repository<Configuration>,
        @InjectRepository(Interval)
        private readonly intervalRepository: Repository<Interval>,
    ) {}

    getConfiguration(): Promise<Configuration> {
        return this.configurationRepository.createQueryBuilder('configuration')
                .leftJoinAndSelect('configuration.changeInterval', 'interval')
                .orderBy('configuration.id','DESC')
                .getOne();
    }

    saveConfiguration(config: IConfiguration) {
        config.lastChangeTimestamp = Date.now();
        return this.configurationRepository.save(config);
    }
}
