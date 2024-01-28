import { ApiProperty } from '@nestjs/swagger';

export class ChatResponse {
    @ApiProperty()
    response: string;

    @ApiProperty()
    chatId: string;

    constructor({ response, chatId }: { response: string; chatId: string }) {
        this.response = response;
        this.chatId = chatId;
    }
}
