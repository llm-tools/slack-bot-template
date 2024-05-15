import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { LlmService } from '../llm/llm.service.js';
import { QueueUtil } from '../../utils/queue.util.js';
import { DeferredSlackEvent } from '../../types/events.js';

@Processor(QueueUtil.QUEUE_NAMES.SLACK_MENTION_RESPONSE)
export class SlackMentionResponseWorker {
    private readonly logger = new Logger(SlackMentionResponseWorker.name);
    private readonly slackClient: WebClient;

    @Inject()
    private readonly llmService: LlmService;

    constructor(configService: ConfigService) {
        this.slackClient = new WebClient(configService.get('SLACK_BOT_TOKEN'));
    }

    @Process()
    async process(job: Job<DeferredSlackEvent>): Promise<any> {
        this.logger.debug(`Processing slack event '${job.data.eventId}'`);

        try {
            const llmResponse = await this.llmService.askQuery(job.data.query, job.data.messageThread);
            this.logger.debug(`LLM Response obtained for slack event '${job.data.eventId}'`);

            const blocks: any[] = [
                {
                    type: 'section',
                    text: {
                        type: 'plain_text',
                        text: llmResponse.result,
                        emoji: true,
                    },
                },
            ];

            if (llmResponse.sources.length > 0) {
                blocks.push({
                    type: 'divider',
                });

                let sources = '*Sources*:';
                for (let i = 0; i < llmResponse.sources.length; i++) {
                    sources += `\n${i + 1}. ${llmResponse.sources[i]}`;
                }

                blocks.push({
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: sources,
                        },
                    ],
                });
            }

            await this.slackClient.chat.postMessage({
                blocks,
                text: llmResponse.result,
                channel: job.data.channel,
                thread_ts: job.data.messageThread,
                unfurl_links: false,
            });

            this.logger.debug(`Finished processing slack event '${job.data.eventId}'`);
        } catch (e) {
            this.logger.error(`Error from LLM - ${e}`);
            await this.slackClient.chat.postMessage({
                text: 'Sorry, the LLM did not respond correctly. Check with the admin if everything is alright!',
                channel: job.data.channel,
                thread_ts: job.data.messageThread,
            });
        }
    }
}
