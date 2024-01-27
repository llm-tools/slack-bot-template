import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule } from '@nestjs/config';

import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';
import { SlackModule } from '../slack/slack.module.js';

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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
