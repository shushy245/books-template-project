import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { defineConfig } from 'cypress';

const makePool = (): Pool =>
    new Pool({
        host: process.env['DB_HOST'] ?? 'localhost',
        port: Number(process.env['DB_PORT'] ?? 5434),
        user: process.env['DB_USER'] ?? 'reading_room',
        password: process.env['DB_PASSWORD'] ?? 'reading_room',
        database: process.env['DB_NAME'] ?? 'reading_room',
    });

type SeedBooksInput = { titles: string[] };
type SeedNamedInput = { name: string };

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:5173',
        specPattern: 'cypress/e2e/**/*.cy.ts',
        supportFile: 'cypress/support/e2e.ts',

        setupNodeEvents(on) {
            on('task', {
                async seedBooks({ titles }: SeedBooksInput): Promise<null> {
                    const pool = makePool();
                    try {
                        const authorId = randomUUID();
                        const shelfId = randomUUID();
                        await pool.query(
                            `INSERT INTO authors (id, name, created_at, updated_at) VALUES ($1, 'Seed Author', now(), now())`,
                            [authorId],
                        );
                        await pool.query(
                            `INSERT INTO shelves (id, name, created_at, updated_at) VALUES ($1, 'Seed Shelf', now(), now())`,
                            [shelfId],
                        );
                        for (const title of titles) {
                            await pool.query(
                                `INSERT INTO books (id, title, author_id, shelf_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, 'WantToRead', now(), now())`,
                                [randomUUID(), title, authorId, shelfId],
                            );
                        }
                    } finally {
                        await pool.end();
                    }
                    return null;
                },

                async seedAuthor({ name }: SeedNamedInput): Promise<null> {
                    const pool = makePool();
                    try {
                        await pool.query(
                            `INSERT INTO authors (id, name, created_at, updated_at) VALUES ($1, $2, now(), now())`,
                            [randomUUID(), name],
                        );
                    } finally {
                        await pool.end();
                    }
                    return null;
                },

                async seedShelf({ name }: SeedNamedInput): Promise<null> {
                    const pool = makePool();
                    try {
                        await pool.query(
                            `INSERT INTO shelves (id, name, created_at, updated_at) VALUES ($1, $2, now(), now())`,
                            [randomUUID(), name],
                        );
                    } finally {
                        await pool.end();
                    }
                    return null;
                },

                async clearBooks(): Promise<null> {
                    const pool = makePool();
                    try {
                        await pool.query('TRUNCATE books, authors, shelves CASCADE');
                    } finally {
                        await pool.end();
                    }
                    return null;
                },
            });
        },
    },
});
