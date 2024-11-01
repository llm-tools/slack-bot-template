import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { LlmService } from './llm.service.js';
import { EmbeddingAddedResponse } from './models/embedding-added-response.model.js';
import { AddConfluenceEmbeddingRequest } from './models/add-confluence-embedding-request.model.js';
import { ChatResponse } from './models/chat-response.model.js';
import { ChatRequest } from './models/chat-request.model.js';

@ApiTags('LLM')
@Controller('llm')
export class LlmController {
    constructor(private readonly llmService: LlmService) {}

    @Post('/embed/confluence')
    @ApiOkResponse({
        type: EmbeddingAddedResponse,
    })
    async addVideoEmbedding(@Body() body: AddConfluenceEmbeddingRequest): Promise<EmbeddingAddedResponse> {
        return new EmbeddingAddedResponse({ ...(await this.llmService.addConfluenceEmbedding(body.spaces)) });
    }

    @Post('/query')
    @ApiOkResponse({
        type: ChatResponse,
    })
    async askQuery(@Body() body: ChatRequest): Promise<ChatResponse> {
        return new ChatResponse({ ...(await this.llmService.askQuery(body.query, body.conversationId)) });
    }
}
