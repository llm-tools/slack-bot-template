import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullRootModuleOptions } from '@nestjs/bull';

@Injectable()
export class QueueUtil {
    public static QUEUE_NAMES = {
        SLACK_MENTION_RESPONSE: 'slack_mention_response',
        CONFLUENCE_LOADER: 'confluence_loader',
        URL_LOADER: 'web_loader',
    };

    constructor(private configService: ConfigService) {}

    async initRedis(): Promise<BullRootModuleOptions> {
        return {
            redis: {
                host: this.configService.get('REDIS_HOST'),
                port: this.configService.get('REDIS_PORT'),
                password: this.configService.get('REDIS_PASSWORD'),
            },
        };
    }
}
