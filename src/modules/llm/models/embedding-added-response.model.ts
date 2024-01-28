import { ApiProperty } from '@nestjs/swagger';

export class EmbeddingAddedResponse {
    @ApiProperty()
    id: string;

    @ApiProperty()
    newEntriesAdded: number;

    constructor({ id, newEntriesAdded }: { id: string; newEntriesAdded: number }) {
        this.id = id;
        this.newEntriesAdded = newEntriesAdded;
    }
}
