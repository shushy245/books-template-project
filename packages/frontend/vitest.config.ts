import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        reporter: 'verbose',
        environment: 'jsdom',
        // Pass with no tests: frontend Vitest tests (utils) are added starting in S4.
        // Cypress handles the integration/E2E side.
        passWithNoTests: true,
    },
});
