import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray } from 'class-validator';

export class AddConfluenceEmbeddingRequest {
    @IsArray()
    @ArrayNotEmpty()
    @ApiProperty()
    spaces: [string, ...string[]];
}
