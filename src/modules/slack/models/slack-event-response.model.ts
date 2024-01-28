import { ApiProperty } from '@nestjs/swagger';

export class SlackEventResponse {
    @ApiProperty()
    processed: boolean;

    @ApiProperty()
    eventId?: string;

    constructor({ processed, eventId }: { processed: boolean; eventId?: string }) {
        this.eventId = eventId;
        this.processed = processed;
    }
}
