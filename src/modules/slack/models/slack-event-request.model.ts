import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsObject, IsString } from 'class-validator';

export class VerifyEndpointRequest {
    @IsString()
    @ApiProperty()
    token: string;

    @IsString()
    @ApiProperty()
    challenge: string;

    @IsString()
    @ApiProperty()
    type: 'url_verification';
}

export class SlackEventRequest {
    @IsString()
    @ApiProperty()
    type: 'event_callback';

    @IsString()
    @ApiProperty()
    token: string;

    @IsString()
    @ApiProperty()
    team_id: string;

    @IsString()
    @ApiProperty()
    api_app_id: string;

    @IsObject()
    @ApiProperty()
    event: AppMentionEventRequest;

    @IsString()
    @ApiProperty()
    event_context: string;

    @IsString()
    @ApiProperty()
    event_id: string;

    @IsNumber()
    @ApiProperty()
    event_time: number;

    @IsArray()
    @ApiProperty()
    authorizations: {
        enterprise_id: string;
        team_id: string;
        user_id: string;
        is_bot: false;
        is_enterprise_install: false;
    }[];

    @IsBoolean()
    @ApiProperty()
    is_ext_shared_channel: false;

    @IsString()
    @ApiProperty()
    context_team_id: string;

    @IsString()
    @ApiProperty()
    context_enterprise_id: string;
}

export class AppMentionEventRequest {
    @IsString()
    @ApiProperty()
    type: 'app_mention';

    @IsString()
    @ApiProperty()
    user: string;

    @IsString()
    @ApiProperty()
    channel: string;

    @IsString()
    @ApiProperty()
    text: string;

    @IsString()
    @ApiProperty()
    ts: string;

    @IsString()
    @ApiProperty()
    thread_ts?: string;

    @IsNumber()
    @ApiProperty()
    event_ts: number;
}
