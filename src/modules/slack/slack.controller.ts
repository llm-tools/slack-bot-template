import { Body, Controller, Headers, Post, RawBodyRequest, Req, UnauthorizedException } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { SlackService } from './slack.service.js';
import { SlackEventRequest, VerifyEndpointRequest } from './models/slack-event-request.model.js';
import { SlackCommandRequest } from './models/slack-command-request.model.js';
import { SlackCommandResponse } from './models/slack-command-response.model.js';
import { SlackEventResponse } from './models/slack-event-response.model.js';
import { SlackVerifyResponse } from './models/slack-verify-response.model.js';

@ApiTags('Slack')
@Controller('slack')
export class SlackController {
    constructor(private readonly slackService: SlackService) {}

    @Post('/event')
    @ApiOkResponse({
        type: SlackEventResponse || SlackVerifyResponse,
    })
    async event(
        @Headers('x-slack-signature') slackSignature: string,
        @Headers('x-slack-request-timestamp') slackRequestTimestamp: string,
        @Body() body: VerifyEndpointRequest | SlackEventRequest,
        @Req() req: RawBodyRequest<Request>,
    ): Promise<SlackEventResponse | SlackVerifyResponse> {
        if (!(await this.slackService.isTokenValid(slackSignature, slackRequestTimestamp, req.rawBody))) {
            throw new UnauthorizedException('Invalid Slack signature token');
        }

        switch (body.type) {
            case 'url_verification':
                return { challenge: body.challenge };
            case 'event_callback':
                switch (body.event.type) {
                    case 'app_mention':
                        const eventId = await this.slackService.slackMention(
                            body.event.text,
                            body.event.thread_ts ?? body.event.ts,
                            body.event.channel,
                        );

                        return { processed: true, eventId };
                }

                return { processed: false };
            default:
                return { processed: false };
        }
    }

    @Post('/command')
    @ApiOkResponse({
        type: SlackCommandResponse,
    })
    async command(
        @Headers('x-slack-signature') slackSignature: string,
        @Headers('x-slack-request-timestamp') slackRequestTimestamp: string,
        @Body() body: SlackCommandRequest,
        @Req() req: RawBodyRequest<Request>,
    ): Promise<SlackCommandResponse> {
        if (!(await this.slackService.isTokenValid(slackSignature, slackRequestTimestamp, req.rawBody))) {
            throw new UnauthorizedException('Invalid Slack signature token');
        }

        switch (body.command) {
            case '/learnfrom':
                return new SlackCommandResponse(
                    await this.slackService.slackLearnCommand(body.text, body.response_url),
                );
            default:
                return new SlackCommandResponse('Unknown command');
        }
    }
}
