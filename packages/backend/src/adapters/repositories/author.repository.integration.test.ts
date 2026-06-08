// Requires: docker compose up -d postgres_test (port 5433)
// Run with: pnpm test:integration
import { sql } from 'drizzle-orm';
import type { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { afterAll, beforeAll } from 'vitest';

import { Db, createDb } from '../../db/client.js';
import { authors } from '../../db/schema.js';
import { AuthorRepository } from './author.repository.js';
import { runAuthorRepositoryContractTests } from '../../domain/ports/author-repository.contract.js';

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

runAuthorRepositoryContractTests(async () => {
    // Cascade clears books too — they FK-reference authors.
    await db.execute(sql`TRUNCATE books, authors, shelves`);

    return {
        repo: new AuthorRepository(db),
        seed: async (author) => {
            await db.insert(authors).values({
                id: author.id,
                name: author.name,
                createdAt: author.createdAt,
                updatedAt: author.updatedAt,
            });
        },
    };
});
