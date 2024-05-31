import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { SlackController } from './slack.controller.js';
import { QueueUtil } from '../../utils/queue.util.js';
import { SlackService } from './slack.service.js';
import { LlmModule } from '../llm/llm.module.js';
import { SlackMentionResponseWorker } from './slack-mention-response.worker.js';
import { SlackConfluenceLoaderWorker } from './slack-confluence-loader.worker.js';
import { SlackWebLoaderWorker } from './slack-url-loader.worker.js';

@Module({
    imports: [
        LlmModule,
        BullModule.registerQueue({
            name: QueueUtil.QUEUE_NAMES.SLACK_MENTION_RESPONSE,
        }),
        BullModule.registerQueue({
            name: QueueUtil.QUEUE_NAMES.CONFLUENCE_LOADER,
        }),
        BullModule.registerQueue({
            name: QueueUtil.QUEUE_NAMES.URL_LOADER,
        }),
    ],
    controllers: [SlackController],
    providers: [SlackService, SlackMentionResponseWorker, SlackConfluenceLoaderWorker, SlackWebLoaderWorker],
})
export class SlackModule {}
