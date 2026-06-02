import { defineConfig } from 'vitest/config';

// Integration test config: requires Docker (docker compose up -d postgres_test).
// Run with: pnpm test:integration
export default defineConfig({
    test: {
        reporter: 'verbose',
        environment: 'node',
        include: ['**/*.integration.test.ts'],
        testTimeout: 15000,
    },
});
