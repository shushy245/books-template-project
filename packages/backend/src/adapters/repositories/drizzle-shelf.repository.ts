import { eq } from 'drizzle-orm';

import { Shelf } from '@reading-room/common';

import { Db } from '../../db/client.js';
import { shelves } from '../../db/schema.js';
import { ShelfRepositoryPort } from '../../domain/ports/shelf-repository.port.js';

export class DrizzleShelfRepository implements ShelfRepositoryPort {
    constructor(private readonly db: Db) {}

    async findById(id: string): Promise<Shelf | undefined> {
        const row = await this.db.query.shelves.findFirst({ where: eq(shelves.id, id) });
        if (row === undefined) return undefined;
        return { id: row.id, name: row.name, createdAt: row.createdAt, updatedAt: row.updatedAt };
    }
}
