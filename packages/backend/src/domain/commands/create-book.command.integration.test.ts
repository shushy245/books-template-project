// Requires: docker compose up -d postgres_test (port 5433)
// Run with: pnpm test:integration
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { ReadingStatus } from '@reading-room/common';

import { Db, createDb } from '../../db/client.js';
import { authors, books, outbox, shelves } from '../../db/schema.js';
import { DrizzleBookRepository } from '../../adapters/repositories/drizzle-book.repository.js';
import { DrizzleUnitOfWork } from '../../adapters/drizzle-unit-of-work.js';
import { UnitOfWorkPort } from '../ports/unit-of-work.port.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';
import { createBook } from './create-book.command.js';

const makeTestDb = (): { pool: Pool; db: Db } =>
    createDb({
        host: process.env['DB_HOST'] ?? 'localhost',
        port: Number(process.env['DB_TEST_PORT'] ?? 5433),
        user: process.env['DB_TEST_USER'] ?? 'reading_room_test',
        password: process.env['DB_TEST_PASSWORD'] ?? 'reading_room_test',
        database: process.env['DB_TEST_NAME'] ?? 'reading_room_test',
    });

describe('createBook integration', () => {
    let pool: Pool;
    let db: Db;

    beforeAll(async () => {
        ({ pool, db } = makeTestDb());
        await migrate(db, { migrationsFolder: './drizzle' });
    });

    afterAll(async () => {
        await pool.end();
    });

    beforeEach(async () => {
        await db.execute(sql`TRUNCATE books, authors, shelves, outbox`);
    });

    const seedAuthorAndShelf = async (): Promise<{ authorId: string; shelfId: string }> => {
        const [author] = await db.insert(authors).values({ name: 'Test Author' }).returning();
        const [shelf] = await db.insert(shelves).values({ name: 'Test Shelf' }).returning();
        if (author === undefined || shelf === undefined) throw new Error('seedAuthorAndShelf: insert failed');
        return { authorId: author.id, shelfId: shelf.id };
    };

    const countBooks = async (): Promise<number> => {
        const rows = await db.select().from(books);
        return rows.length;
    };

    const countOutboxEvents = async (): Promise<number> => {
        const rows = await db.select().from(outbox);
        return rows.length;
    };

    const assertBookAndOutboxEvent = async (bookCount: number, outboxCount: number): Promise<void> => {
        expect(await countBooks()).toBe(bookCount);
        expect(await countOutboxEvents()).toBe(outboxCount);
    };

    it('writes one book row and one outbox event in the same transaction', async () => {
        const { authorId, shelfId } = await seedAuthorAndShelf();
        const deps = {
            shelfRepo: {
                findById: async () => ({
                    id: shelfId,
                    name: 'Test Shelf',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            },
            unitOfWork: new DrizzleUnitOfWork(db),
            logger: makeFakeLogger(),
        };

        await createBook(deps, { title: 'Dune', authorId, shelfId, status: ReadingStatus.WantToRead });

        await assertBookAndOutboxEvent(1, 1);
    });

    it('rolls back both the book and the outbox event when the transaction fails', async () => {
        const { authorId, shelfId } = await seedAuthorAndShelf();

        // A UnitOfWork that uses a real Postgres transaction but injects a failing outbox repo —
        // proving the book INSERT is rolled back when the outbox append throws.
        const unitOfWork: UnitOfWorkPort = {
            run: (work) =>
                db.transaction(async (tx) =>
                    work({
                        bookRepo: new DrizzleBookRepository(tx),
                        outboxRepo: {
                            append: async () => {
                                throw new Error('forced failure');
                            },
                        },
                    }),
                ),
        };

        const deps = {
            shelfRepo: {
                findById: async () => ({
                    id: shelfId,
                    name: 'Test Shelf',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            },
            unitOfWork,
            logger: makeFakeLogger(),
        };

        await expect(
            createBook(deps, { title: 'Dune', authorId, shelfId, status: ReadingStatus.WantToRead }),
        ).rejects.toThrow('forced failure');

        await assertBookAndOutboxEvent(0, 0);
    });
});
