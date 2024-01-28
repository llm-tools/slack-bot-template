import { ApiProperty } from '@nestjs/swagger';

export class SlackVerifyResponse {
    @ApiProperty()
    challenge: string;

    constructor(challenge: string) {
        this.challenge = challenge;
    }
}
