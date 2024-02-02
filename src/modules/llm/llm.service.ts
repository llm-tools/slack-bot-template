import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import { ConfluenceLoader, LLMApplication, LLMApplicationBuilder, SIMPLE_MODELS, WebLoader } from '@llm-tools/embedjs';
import { RedisCache } from '@llm-tools/embedjs/cache/redis';
import { LanceDb } from '@llm-tools/embedjs/vectorDb/lance';

@Injectable()
export class LlmService implements OnModuleInit {
    private llmApplication: LLMApplication;

    @Inject()
    private readonly configService: ConfigService;

    async onModuleInit() {
        this.llmApplication = await new LLMApplicationBuilder()
            .setTemperature(0.1)
            .setModel(SIMPLE_MODELS.OPENAI_GPT4)
            .setVectorDb(
                new LanceDb({
                    path: './docker/lmdb',
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
    }

    async addWebEmbedding(url: string): Promise<{ id: string; newEntriesAdded: number }> {
        const { uniqueId, entriesAdded } = await this.llmApplication.addLoader(new WebLoader({ url }));
        return { id: uniqueId, newEntriesAdded: entriesAdded };
    }

    async addConfluenceEmbedding(
        confluenceSpaces: [string, ...string[]],
    ): Promise<{ id: string; newEntriesAdded: number }> {
        const { uniqueId, entriesAdded } = await this.llmApplication.addLoader(
            new ConfluenceLoader({ spaceNames: confluenceSpaces }),
        );

        return { id: uniqueId, newEntriesAdded: entriesAdded };
    }

    async askQuery(query: string, chatId?: string): Promise<{ chatId: string; result: string; sources: string[] }> {
        chatId = chatId ?? nanoid();
        const response = await this.llmApplication.query(query, chatId);
        return { chatId, result: response.result, sources: response.sources };
    }
}
