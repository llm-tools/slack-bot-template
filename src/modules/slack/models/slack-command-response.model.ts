import { ApiProperty } from '@nestjs/swagger';

export class SlackCommandResponse {
    @ApiProperty()
    response_type: 'in_channel';

    @ApiProperty()
    text: string;

    constructor(text: string) {
        this.text = text;
        this.response_type = 'in_channel';
    }
}
