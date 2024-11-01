import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

import { LocalPathLoader, RAGApplication, RAGApplicationBuilder } from '@llm-tools/embedjs';
import { OpenAi, OpenAiEmbeddings } from '@llm-tools/embedjs-openai';
import { ConfluenceLoader } from '@llm-tools/embedjs-loader-confluence';
import { RedisStore } from '@llm-tools/embedjs-redis';
import { LanceDb } from '@llm-tools/embedjs-lancedb';

@Injectable()
export class LlmService implements OnModuleInit {
    private readonly logger = new Logger(LlmService.name);
    private ragApplication: RAGApplication;

    @Inject()
    private readonly configService: ConfigService;

    async onModuleInit() {
        this.ragApplication = await new RAGApplicationBuilder()
            .setTemperature(0.1)
            .setModel(new OpenAi({ modelName: 'gpt-4o' }))
            .setEmbeddingModel(new OpenAiEmbeddings())
            .setEmbeddingRelevanceCutOff(0.23)
            .setVectorDatabase(
                new LanceDb({
                    path: './docker/lmdb',
                }),
            )
            .setStore(
                new RedisStore({
                    host: this.configService.get('REDIS_HOST'),
                    port: this.configService.get('REDIS_PORT'),
                    password: this.configService.get('REDIS_PASSWORD'),
                }),
            )
            .build();
    }

    async addWebEmbedding(url: string): Promise<{ id: string; newEntriesAdded: number; loaderType: string }> {
        const { uniqueId, entriesAdded, loaderType } = await this.ragApplication.addLoader(
            new LocalPathLoader({ path: './temp/Information_Papernest.pdf' }),
        );
        return { id: uniqueId, newEntriesAdded: entriesAdded, loaderType };
    }

    async addConfluenceEmbedding(
        confluenceSpaces: [string, ...string[]],
    ): Promise<{ id: string; newEntriesAdded: number }> {
        const { uniqueId, entriesAdded } = await this.ragApplication.addLoader(
            new ConfluenceLoader({
                spaceNames: confluenceSpaces,
            }),
        );

        return { id: uniqueId, newEntriesAdded: entriesAdded };
    }

    async askQuery(
        query: string,
        conversationId?: string,
    ): Promise<{ conversationId: string; result: string; sources: string[] }> {
        conversationId = conversationId ?? nanoid();
        const response = await this.ragApplication.query(query, { conversationId });

        this.logger.debug('LLM response: ' + JSON.stringify(response));
        return { conversationId, result: response.content, sources: response.sources.map((s) => s.source) };
    }
}
