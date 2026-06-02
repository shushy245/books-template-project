// Requires: docker compose up -d postgres_test (port 5433)
// These tests run in CI with the postgres_test service.
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, it } from 'vitest';

const makeTestPool = (): Pool =>
  new Pool({
    host: process.env['DB_HOST'] ?? 'localhost',
    port: Number(process.env['DB_TEST_PORT'] ?? 5433),
    user: process.env['DB_TEST_USER'] ?? 'reading_room_test',
    password: process.env['DB_TEST_PASSWORD'] ?? 'reading_room_test',
    database: process.env['DB_TEST_NAME'] ?? 'reading_room_test',
  });

describe('Drizzle migrations', () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = makeTestPool();
    const db = drizzle(pool);
    await db.execute(sql`DROP SCHEMA public CASCADE`);
    await db.execute(sql`CREATE SCHEMA public`);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('runs all migrations without error', async () => {
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder: './drizzle' });
  });
});
