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
        const spaces = job.data.spaces.join(', ');
        this.logger.debug(`Processing slack confluence load for spaces '${spaces}'`);

        let newEntriesAdded = 0;
        let slackMessage = `Finished processing confluence spaces `;
        for (const space of job.data.spaces) {
            try {
                this.logger.debug(`Adding confluence space '${space}'`);
                const llmResponse = await this.llmService.addConfluenceEmbedding([space]);
                this.logger.debug(`Finished adding confluence space '${space}'`);

                newEntriesAdded += llmResponse.newEntriesAdded;
                slackMessage += `\`${space}\`, `;
            } catch (e) {
                this.logger.error(`Error adding confluence space '${space}'`, e);
            }
        }

        slackMessage = slackMessage.slice(0, -2);
        slackMessage += `. Total new entries added \`${newEntriesAdded}\`.`;
        this.logger.debug(slackMessage);

        await axios.post(job.data.responseUrl, {
            text: slackMessage,
            response_type: 'in_channel',
        });

        this.logger.debug(`Finished processing slack confluence load for spaces '${spaces}'`);
    }
}
