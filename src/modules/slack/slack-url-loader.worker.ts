import { Inject, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import axios from 'axios';

import { LlmService } from '../llm/llm.service.js';
import { QueueUtil } from '../../utils/queue.util.js';
import { WebLoaderCommand } from '../../types/commands.js';

@Processor(QueueUtil.QUEUE_NAMES.URL_LOADER)
export class SlackWebLoaderWorker {
    private readonly logger = new Logger(SlackWebLoaderWorker.name);

    @Inject()
    private readonly llmService: LlmService;

    @Process()
    async process(job: Job<WebLoaderCommand>): Promise<any> {
        this.logger.debug(`Processing load for url '${job.data.url}'`);

        const llmResponse = await this.llmService.addWebEmbedding(job.data.url);
        this.logger.debug(`Finished adding ${llmResponse.newEntriesAdded} entries from web url '${job.data.url}'`);

        await axios.post(job.data.responseUrl, {
            text: `Added \`${llmResponse.newEntriesAdded}\` entries from url \`${job.data.url}\` to knowledge bank using \`${llmResponse.loaderType}\``,
            response_type: 'in_channel',
        });

        this.logger.debug(`Finished processing slack web url '${job.data.url}'`);
    }
}
