import { Module } from '@nestjs/common';

import { SlackController } from './slack.controller.js';
import { SlackService } from './slack.service.js';

@Module({
    imports: [],
    controllers: [SlackController],
    providers: [SlackService],
})
export class SlackModule {}
