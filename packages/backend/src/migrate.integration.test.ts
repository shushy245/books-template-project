// Requires: docker compose up -d postgres_test (port 5433)
// These tests run in CI with the postgres_test service.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const makeTestPool = (): Pool =>
    new Pool({
        host: process.env['DB_HOST'] ?? 'localhost',
        port: Number(process.env['DB_TEST_PORT'] ?? 5433),
        user: process.env['DB_TEST_USER'] ?? 'reading_room_test',
        password: process.env['DB_TEST_PASSWORD'] ?? 'reading_room_test',
        database: process.env['DB_TEST_NAME'] ?? 'reading_room_test',
    });

const columnsFor = async (db: ReturnType<typeof drizzle>, tableName: string): Promise<string[]> => {
    const result = await db.execute(
        sql`SELECT column_name FROM information_schema.columns WHERE table_name = ${tableName} AND table_schema = 'public'`,
    );

    return result.rows.map((r) => String(r['column_name']));
};

describe('Drizzle migrations', () => {
    let pool: Pool;
    let db: ReturnType<typeof drizzle>;

    beforeAll(async () => {
        pool = makeTestPool();
        db = drizzle(pool);
        await db.execute(sql`DROP SCHEMA public CASCADE`);
        await db.execute(sql`CREATE SCHEMA public`);
        await migrate(db, { migrationsFolder: './drizzle' });
    });

    afterAll(async () => {
        await pool.end();
    });

    const assertTableHasColumns = async (tableName: string, expected: string[]): Promise<void> => {
        const columns = await columnsFor(db, tableName);
        for (const col of expected) {
            expect(columns).toContain(col);
        }
    };

    it('runs all migrations without error', () => {
        // migration ran in beforeAll — reaching this point means it succeeded
    });

    it('creates the books table with all expected columns', async () => {
        await assertTableHasColumns('books', [
            'id',
            'title',
            'author_id',
            'shelf_id',
            'status',
            'rating',
            'created_at',
            'updated_at',
        ]);
    });

    it('creates the outbox table with aggregate_id and processed_at columns', async () => {
        await assertTableHasColumns('outbox', ['aggregate_id', 'processed_at']);
    });
});
