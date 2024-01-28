import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { SlackModule } from '../slack/slack.module.js';
import { QueueUtil } from '../../utils/queue.util.js';

@Module({
    imports: [
        SlackModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        LoggerModule.forRoot({
            pinoHttp: {
                serializers: {
                    req: (req) => ({
                        id: req.id,
                        method: req.method,
                        url: req.url,
                    }),
                    res: (res) => ({
                        statusCode: res.statusCode,
                    }),
                },
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        singleLine: true,
                    },
                },
                level: 'trace',
            },
        }),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => new QueueUtil(configService).initRedis(),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
