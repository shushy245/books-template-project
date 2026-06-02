import { defineConfig } from 'vitest/config';

// Unit test config: no DB required, fast, deterministic.
// Integration tests (requiring Docker/Postgres) live in vitest.config.integration.ts.
export default defineConfig({
    test: {
        reporter: 'verbose',
        environment: 'node',
        exclude: ['**/node_modules/**', '**/dist/**', '**/*.integration.test.ts'],
    },
});
