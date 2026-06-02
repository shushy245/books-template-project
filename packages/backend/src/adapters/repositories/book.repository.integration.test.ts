// Requires: docker compose up -d postgres_test (port 5433)
// Run with: pnpm test:integration
import { sql } from 'drizzle-orm';
import type { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { afterAll, beforeAll } from 'vitest';

import { Db, createDb } from '../../db/client.js';
import { authors, shelves } from '../../db/schema.js';
import { BookRepository } from './book.repository.js';
import { runBookRepositoryContractTests } from '../../domain/ports/book-repository.contract.js';

const makeTestDb = (): { pool: Pool; db: Db } =>
    createDb({
        host: process.env['DB_HOST'] ?? 'localhost',
        port: Number(process.env['DB_TEST_PORT'] ?? 5433),
        user: process.env['DB_TEST_USER'] ?? 'reading_room_test',
        password: process.env['DB_TEST_PASSWORD'] ?? 'reading_room_test',
        database: process.env['DB_TEST_NAME'] ?? 'reading_room_test',
    });

let pool: Pool;
let db: Db;

beforeAll(async () => {
    ({ pool, db } = makeTestDb());
    await migrate(db, { migrationsFolder: './drizzle' });
});

afterAll(async () => {
    await pool.end();
});

runBookRepositoryContractTests(async () => {
    // Truncate in one statement — PostgreSQL handles FK ordering atomically across tables.
    await db.execute(sql`TRUNCATE books, authors, shelves`);

    // Insert real authors and shelves so book FK constraints are satisfied.
    const [authorRow] = await db.insert(authors).values({ name: 'Test Author' }).returning();
    const [shelfRow] = await db.insert(shelves).values({ name: 'Shelf A' }).returning();
    const [altShelfRow] = await db.insert(shelves).values({ name: 'Shelf B' }).returning();

    if (authorRow === undefined || shelfRow === undefined || altShelfRow === undefined) {
        throw new Error('book.repository.integration setup: failed to insert required FK rows');
    }

    return {
        repo: new BookRepository(db),
        authorId: authorRow.id,
        shelfId: shelfRow.id,
        alternateShelfId: altShelfRow.id,
    };
});
