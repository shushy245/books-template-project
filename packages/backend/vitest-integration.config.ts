import path from 'path';
import { defineConfig } from 'vitest/config';

// Integration test config: requires Docker (docker compose up -d postgres_test).
// Run with: pnpm test:integration
//
// fileParallelism: false — integration tests share a single Postgres DB.
// Running files in parallel races on DROP SCHEMA / TRUNCATE operations.
export default defineConfig({
    resolve: {
        alias: {
            '~': path.resolve(__dirname, 'src'),
        },
    },
    test: {
        reporter: 'verbose',
        environment: 'node',
        include: ['**/*.integration.test.ts'],
        testTimeout: 15000,
        fileParallelism: false,
    },
});
