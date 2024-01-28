import { Inject, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';

import { LlmService } from '../llm/llm.service.js';
import { QueueUtil } from '../../utils/queue.util.js';
import { ConfluenceLoaderCommand } from '../../types/commands.js';

@Processor(QueueUtil.QUEUE_NAMES.CONFLUENCE_LOADER)
export class SlackConfluenceLoaderWorker {
    private readonly logger = new Logger(SlackConfluenceLoaderWorker.name);

    @Inject()
    private readonly llmService: LlmService;

    @Process()
    async process(job: Job<ConfluenceLoaderCommand>): Promise<any> {
        this.logger.debug(`Processing slack confluence load for space '${job.data.space}'`);

        const llmResponse = await this.llmService.addConfluenceEmbedding([job.data.space]);
        this.logger.debug(
            `Finished adding ${llmResponse.newEntriesAdded} entries from confluence space '${job.data.space}'`,
        );

        await axios.post(job.data.responseUrl, {
            text: `Added \`${llmResponse.newEntriesAdded}\` entries from confluence space \`${job.data.space}\` to knowledge bank`,
            response_type: 'in_channel',
        });

        this.logger.debug(`Finished processing slack confluence space '${job.data.space}'`);
    }
}
