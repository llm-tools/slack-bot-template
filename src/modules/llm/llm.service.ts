import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import { OpenAi3SmallEmbeddings, RAGApplication, RAGApplicationBuilder, SIMPLE_MODELS } from '@llm-tools/embedjs';
import { RedisCache } from '@llm-tools/embedjs/cache/redis';
import { LanceDb } from '@llm-tools/embedjs/vectorDb/lance';

@Injectable()
export class LlmService implements OnModuleInit {
    private readonly logger = new Logger(LlmService.name);
    private ragApplication: RAGApplication;

    @Inject()
    private readonly configService: ConfigService;

    async onModuleInit() {
        this.ragApplication = await new RAGApplicationBuilder()
            .setTemperature(0.1)
            .setModel(SIMPLE_MODELS.OPENAI_GPT4_O)
            .setEmbeddingModel(new OpenAi3SmallEmbeddings())
            .setEmbeddingRelevanceCutOff(0.23)
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

    async addWebEmbedding(url: string): Promise<{ id: string; newEntriesAdded: number; loaderType: string }> {
        const { uniqueId, entriesAdded, loaderType } = await this.ragApplication.addLoader(url);
        return { id: uniqueId, newEntriesAdded: entriesAdded, loaderType };
    }

    async addConfluenceEmbedding(
        confluenceSpaces: [string, ...string[]],
    ): Promise<{ id: string; newEntriesAdded: number }> {
        const { uniqueId, entriesAdded } = await this.ragApplication.addLoader({
            type: 'Confluence',
            spaceNames: confluenceSpaces,
        });

        return { id: uniqueId, newEntriesAdded: entriesAdded };
    }

    async askQuery(query: string, chatId?: string): Promise<{ chatId: string; result: string; sources: string[] }> {
        chatId = chatId ?? nanoid();
        const response = await this.ragApplication.query(query, chatId);

        this.logger.debug('LLM response: ' + JSON.stringify(response));
        return { chatId, result: response.content, sources: response.sources.map((s) => s.source) };
    }
}
