import { ApiProperty } from '@nestjs/swagger';

export class ChatResponse {
    @ApiProperty()
    conversationId: string;

    @ApiProperty()
    result: string;

    @ApiProperty()
    sources: string[];

    constructor({ result, conversationId, sources }: { result: string; conversationId: string; sources: string[] }) {
        this.conversationId = conversationId;
        this.result = result;
        this.sources = sources;
    }
}
