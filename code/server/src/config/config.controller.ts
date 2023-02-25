import {Body, Controller, Get, Post} from '@nestjs/common';
import {ConfigService} from "./config.service.js";

@Controller('api/config')
export class ConfigController {
    constructor(private readonly configService: ConfigService) {
    }

    @Get('')
    getConfiguration() {
        return this.configService.getConfiguration();
    }

    @Post('')
    saveConfiguration(@Body() config)  {
        return this.configService.saveConfiguration(config);
    }
}
