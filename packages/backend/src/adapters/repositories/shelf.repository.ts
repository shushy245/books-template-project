import { asc, eq } from 'drizzle-orm';

import { Shelf } from '@reading-room/common';

import { Db } from '../../db/client.ts';
import { shelves } from '../../db/schema.ts';
import { ShelfRepositoryPort } from '../../domain/ports/shelf-repository.port.ts';

export class ShelfRepository implements ShelfRepositoryPort {
    constructor(private readonly db: Db) {}

    async findById(id: string): Promise<Shelf | undefined> {
        const row = await this.db.query.shelves.findFirst({ where: eq(shelves.id, id) });
        if (row === undefined) return undefined;
        return { id: row.id, name: row.name, createdAt: row.createdAt, updatedAt: row.updatedAt };
    }

    async list(): Promise<Shelf[]> {
        const rows = await this.db.query.shelves.findMany({ orderBy: asc(shelves.name) });

        return rows.map((row) => ({ id: row.id, name: row.name, createdAt: row.createdAt, updatedAt: row.updatedAt }));
    }
}
