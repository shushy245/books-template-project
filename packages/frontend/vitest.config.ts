import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        reporter: 'verbose',
        environment: 'jsdom',
        setupFiles: ['./src/testing/setup.ts'],
        clearMocks: true,
        passWithNoTests: true,
    },
});
