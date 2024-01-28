import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { nanoid } from 'nanoid';
import { Queue } from 'bull';

import { slackEncode, timingSafeEqual } from '../../utils/crypto.util.js';
import { DeferredSlackEvent } from '../../types/events.js';
import { ObjectUtils } from '../../utils/object.util.js';
import { QueueUtil } from '../../utils/queue.util.js';
import { LlmService } from '../llm/llm.service.js';
import { ConfluenceLoaderCommand, WebLoaderCommand } from 'src/types/commands.js';

@Injectable()
export class SlackService {
    private readonly logger = new Logger(SlackService.name);

    @Inject()
    private readonly configService: ConfigService;

    constructor(
        @InjectQueue(QueueUtil.QUEUE_NAMES.SLACK_MENTION_RESPONSE)
        private readonly slackMentionResponseQueue: Queue<DeferredSlackEvent>,
        @InjectQueue(QueueUtil.QUEUE_NAMES.CONFLUENCE_LOADER)
        private readonly slackConfluenceLoaderQueue: Queue<ConfluenceLoaderCommand>,
        @InjectQueue(QueueUtil.QUEUE_NAMES.WEB_LOADER)
        private readonly slackWebLoaderQueue: Queue<WebLoaderCommand>,
    ) {}

    async isTokenValid(
        slackSignature: string,
        slackRequestTimestampString: string,
        body: Record<string, any>,
    ): Promise<boolean> {
        if (!this.configService.get('SLACK_SIGNING_SECRET')) {
            this.logger.warn('SLACK_SIGNING_SECRET not set');
            return false;
        }

        if (!ObjectUtils.isNumber(slackRequestTimestampString)) return false;

        const slackRequestTimestamp = parseInt(slackRequestTimestampString);
        const time = Math.floor(new Date().getTime() / 1000);
        if (Math.abs(time - slackRequestTimestamp) > 300) {
            return false;
        }

        const sigBasestring = `v0:${slackRequestTimestampString}:${body}`;
        const mySignature = `v0=${slackEncode(sigBasestring, this.configService.get('SLACK_SIGNING_SECRET'))}`;

        return timingSafeEqual(slackSignature, mySignature);
    }

    async slackMention(query: string, messageThread: string, channel: string): Promise<string> {
        const eventId = nanoid();
        this.slackMentionResponseQueue.add({ eventId, query, messageThread, channel });
        return eventId;
    }

    async slackLearnCommand(commandString: string, responseUrl: string): Promise<string> {
        const commandParts = commandString.split(' ');
        if (commandParts.length != 2) {
            return 'Invalid command. Please use format `/learnfrom confluence shareddata`. Add no additional parameters';
        }

        const command = commandParts[0];
        const parameter = commandParts[1];

        switch (command) {
            case 'confluence':
                this.slackConfluenceLoaderQueue.add({ space: parameter, responseUrl });
                return `Learning from confluence space \`${parameter}\` queued`;
            case 'web':
                this.slackWebLoaderQueue.add({ url: parameter, responseUrl });
                return `Learning from web url \`${parameter}\` queued`;
            default:
                return `Unknown loader \`${command}\``;
        }
    }
}
