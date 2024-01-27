import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { nanoid } from 'nanoid';

import { slackEncode, timingSafeEqual } from '../../utils/crypto.util.js';
import { ConfluenceLoader, LLMApplication, LLMApplicationBuilder, SIMPLE_MODELS } from '@llm-tools/embedjs';
import { RedisCache } from '@llm-tools/embedjs/cache/redis';
import { LanceDb } from '@llm-tools/embedjs/vectorDb/lance';
import { ObjectUtils } from '../../utils/object.util.js';

@Injectable()
export class SlackService implements OnModuleInit {
    private readonly logger = new Logger(SlackService.name);

    private slackClient: WebClient;
    private llmApplication: LLMApplication;

    @Inject()
    private readonly configService: ConfigService;

    async onModuleInit() {
        this.llmApplication = await new LLMApplicationBuilder()
            .setTemperature(0.1)
            .setModel(SIMPLE_MODELS.OPENAI_GPT4)
            .setVectorDb(
                new LanceDb({
                    path: '/home/adhityan/workspaces/potter-bot/docker/lmdb',
                }),
            )
            .setCache(
                new RedisCache({
                    host: this.configService.get('REDIS_HOST'),
                    port: this.configService.get('REDIS_PORT'),
                    password: this.configService.get('REDIS_PASSWORD'),
                }),
            )
            .build();

        this.slackClient = new WebClient(this.configService.get('SLACK_BOT_TOKEN'));
    }

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

    async slackMention(query: string, messageThread: string, channel: string) {
        await this.slackClient.chat.postMessage({
            text: 'Test ' + query,
            thread_ts: messageThread,
            channel: channel,
        });
    }

    async addConfluenceEmbedding(
        confluenceSpaces: [string, ...string[]],
    ): Promise<{ id: string; newEntriesAdded: number }> {
        const { uniqueId, entriesAdded } = await this.llmApplication.addLoader(
            new ConfluenceLoader({ spaceNames: confluenceSpaces }),
        );

        return { id: uniqueId, newEntriesAdded: entriesAdded };
    }

    async askQuery(query: string, chatId?: string): Promise<{ response: string; chatId: string }> {
        chatId = chatId ?? nanoid();
        return { response: await this.llmApplication.query(query, chatId), chatId };
    }
}
