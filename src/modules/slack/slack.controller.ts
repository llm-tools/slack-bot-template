import { Body, Controller, Headers, Post, RawBodyRequest, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { SlackService } from './slack.service.js';
import { EmbeddingAddedResponse } from './models/embedding-added-response.model.js';
import { AddConfluenceEmbeddingRequest } from './models/add-confluence-embedding-request.model.js';
import { SlackEventRequest, VerifyEndpointRequest } from './models/slack-event-request.model.js';
import { ChatResponse } from './models/chat-response.model.js';
import { ChatRequest } from './models/chat-request.model.js';

@ApiTags('Slack')
@Controller('slack')
export class SlackController {
    constructor(private readonly slackService: SlackService) {}

    @Post('/event')
    async event(
        @Headers('x-slack-signature') slackSignature: string,
        @Headers('x-slack-request-timestamp') slackRequestTimestamp: string,
        @Body() body: VerifyEndpointRequest | SlackEventRequest,
        @Req() req: RawBodyRequest<Request>,
    ): Promise<any> {
        if (!(await this.slackService.isTokenValid(slackSignature, slackRequestTimestamp, req.rawBody))) {
            throw new UnauthorizedException('Invalid Slack Token');
        }

        switch (body.type) {
            case 'url_verification':
                return { challenge: body.challenge };
            case 'event_callback':
                switch (body.event.type) {
                    case 'app_mention':
                        await this.slackService.slackMention(
                            body.event.text,
                            body.event.thread_ts ?? body.event.ts,
                            body.event.channel,
                        );

                        return { processed: true };
                }

                return { processed: false };
            default:
                return { processed: false };
        }
    }

    @Post('/embed/confluence')
    @ApiOkResponse({
        type: EmbeddingAddedResponse,
    })
    async addVideoEmbedding(@Body() body: AddConfluenceEmbeddingRequest): Promise<EmbeddingAddedResponse> {
        return new EmbeddingAddedResponse({ ...(await this.slackService.addConfluenceEmbedding(body.spaces)) });
    }

    @Post('/query')
    @ApiOkResponse({
        type: ChatResponse,
    })
    async askQuery(@Body() body: ChatRequest): Promise<ChatResponse> {
        return new ChatResponse({ ...(await this.slackService.askQuery(body.query, body.chatId)) });
    }
}
