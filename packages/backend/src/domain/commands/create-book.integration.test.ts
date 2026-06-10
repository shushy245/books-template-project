// Requires: docker compose up -d postgres_test (port 5433)
// Run with: pnpm test:integration
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { Db, createDb } from '../../db/client.ts';
import { authors, books, outbox, shelves } from '../../db/schema.ts';
import { BookRepository } from '../../adapters/repositories/book.repository.ts';
import { AuthorRepository } from '../../adapters/repositories/author.repository.ts';
import { Store } from '../../adapters/store.ts';
import { StorePort } from '../ports/store.port.ts';
import { aBook } from '../../testing/builders/index.ts';
import { makeFakeLogger } from '../../testing/fake-logger.ts';
import { FakeOutboxRepository } from '../../testing/fake-outbox.repository.ts';
import { createBook } from './create-book.ts';

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

    const countRows = async (table: typeof books | typeof outbox): Promise<number> =>
        (await db.select().from(table)).length;

    const assertCounts = async (bookCount: number, outboxCount: number): Promise<void> => {
        expect(await countRows(books)).toBe(bookCount);
        expect(await countRows(outbox)).toBe(outboxCount);
    };

    it('writes one book row and one outbox event in the same transaction', async () => {
        const { authorId, shelfId } = await seedAuthorAndShelf();

        await createBook(
            { store: new Store(db), logger: makeFakeLogger() },
            aBook({ title: 'Dune', authorId, shelfId }).buildDTO(),
        );

        await assertCounts(1, 1);
    });

    it('rolls back both the book and the outbox event when the transaction fails', async () => {
        const { authorId, shelfId } = await seedAuthorAndShelf();

        const store: StorePort = {
            books: new BookRepository(db),
            authors: new AuthorRepository(db),
            shelves: {
                findById: async () => ({
                    id: shelfId,
                    name: 'Test Shelf',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
                list: async () => [],
            },
            outbox: new FakeOutboxRepository(),
            deadLetters: { append: async () => {} },
            transaction: (work) =>
                db.transaction(async (tx) =>
                    work({
                        books: new BookRepository(tx),
                        outbox: {
                            append: async () => {
                                throw new Error('forced failure');
                            },
                            fetchUnprocessed: async () => [],
                            markProcessed: async () => {},
                            incrementDeliveryCount: async () => {},
                        },
                        deadLetters: { append: async () => {} },
                    }),
                ),
        };

        await expect(
            createBook({ store, logger: makeFakeLogger() }, aBook({ title: 'Dune', authorId, shelfId }).buildDTO()),
        ).rejects.toThrow('forced failure');

        await assertCounts(0, 0);
    });
});
