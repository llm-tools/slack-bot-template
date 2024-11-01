import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ChatRequest {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    query: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    conversationId?: string;
}
