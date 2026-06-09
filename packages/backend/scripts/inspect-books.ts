import { createDb } from '../src/db/client.ts';

const { pool, db } = createDb({
    host: process.env['DB_HOST'] ?? 'localhost',
    port: Number(process.env['DB_PORT'] ?? 5434),
    user: process.env['DB_USER'] ?? 'reading_room',
    password: process.env['DB_PASSWORD'] ?? 'reading_room',
    database: process.env['DB_NAME'] ?? 'reading_room',
});

const books = await db.query.books.findMany();
// eslint-disable-next-line no-console
console.table(books);

await pool.end();
