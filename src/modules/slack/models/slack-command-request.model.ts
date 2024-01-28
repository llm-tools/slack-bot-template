import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SlackCommandRequest {
    @IsString()
    @ApiProperty()
    token: string;

    @IsString()
    @ApiProperty()
    team_id: string;

    @IsString()
    @ApiProperty()
    team_domain: string;

    @IsString()
    @ApiProperty()
    channel_id: string;

    @IsString()
    @ApiProperty()
    channel_name: string;

    @IsString()
    @ApiProperty()
    user_id: string;

    @IsString()
    @ApiProperty()
    user_name: string;

    @IsString()
    @ApiProperty()
    command: string;

    @IsString()
    @ApiProperty()
    text: string;

    @IsString()
    @ApiProperty()
    response_url: string;

    @IsString()
    @ApiProperty()
    trigger_id: string;

    @IsString()
    @ApiProperty()
    is_enterprise_install: string;

    @IsString()
    @ApiProperty()
    api_app_id: string;
}
