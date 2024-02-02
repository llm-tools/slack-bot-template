import { ApiProperty } from '@nestjs/swagger';

export class ChatResponse {
    @ApiProperty()
    chatId: string;

    @ApiProperty()
    result: string;

    @ApiProperty()
    sources: string[];

    constructor({ result, chatId, sources }: { result: string; chatId: string; sources: string[] }) {
        this.chatId = chatId;
        this.result = result;
        this.sources = sources;
    }
}
