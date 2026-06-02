import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env['DB_HOST'] ?? 'localhost',
    port: Number(process.env['DB_PORT'] ?? 5432),
    user: process.env['DB_USER'] ?? 'reading_room',
    password: process.env['DB_PASSWORD'] ?? 'reading_room',
    database: process.env['DB_NAME'] ?? 'reading_room',
  },
});
