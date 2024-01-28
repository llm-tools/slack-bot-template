import { Module } from '@nestjs/common';

import { LlmController } from './llm.controller.js';
import { LlmService } from './llm.service.js';

@Module({
    imports: [],
    controllers: [LlmController],
    providers: [LlmService],
    exports: [LlmService],
})
export class LlmModule {}
