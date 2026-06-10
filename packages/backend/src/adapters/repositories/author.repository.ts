import { asc, eq } from 'drizzle-orm';
import { Author } from '@reading-room/common';

import { Db } from '../../db/client.ts';
import { authors } from '../../db/schema.ts';
import { AuthorRepositoryPort } from '../../domain/ports/author-repository.port.ts';

export class AuthorRepository implements AuthorRepositoryPort {
    constructor(private readonly db: Db) {}

    async findById(id: string): Promise<Author | undefined> {
        const row = await this.db.query.authors.findFirst({ where: eq(authors.id, id) });
        if (row === undefined) {
            return undefined;
        }

        return { id: row.id, name: row.name, createdAt: row.createdAt, updatedAt: row.updatedAt };
    }

    async list(): Promise<Author[]> {
        const rows = await this.db.query.authors.findMany({ orderBy: asc(authors.name) });

        return rows.map((row) => ({ id: row.id, name: row.name, createdAt: row.createdAt, updatedAt: row.updatedAt }));
    }
}
