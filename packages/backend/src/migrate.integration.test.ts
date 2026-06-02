// Requires: docker compose up -d postgres_test (port 5433)
// These tests run in CI with the postgres_test service.
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

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

    it('runs all migrations without error', () => {
        // migration ran in beforeAll — reaching this point means it succeeded
    });

    it('creates the books table with all expected columns', async () => {
        const columns = await columnsFor(db, 'books');
        expect(columns).toContain('id');
        expect(columns).toContain('title');
        expect(columns).toContain('author_id');
        expect(columns).toContain('shelf_id');
        expect(columns).toContain('status');
        expect(columns).toContain('rating');
        expect(columns).toContain('created_at');
        expect(columns).toContain('updated_at');
    });

    it('creates the outbox table with aggregate_id and processed_at columns', async () => {
        const columns = await columnsFor(db, 'outbox');
        expect(columns).toContain('aggregate_id');
        expect(columns).toContain('processed_at');
    });
});
