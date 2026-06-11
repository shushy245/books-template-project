import { z } from 'zod';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { defineConfig } from 'cypress';

const DbConfigSchema = z.object({
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
});

const dbConfig = DbConfigSchema.parse(process.env);

const makePool = (): Pool =>
    new Pool({
        host: dbConfig.DB_HOST,
        port: dbConfig.DB_PORT,
        user: dbConfig.DB_USER,
        password: dbConfig.DB_PASSWORD,
        database: dbConfig.DB_NAME,
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
