import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            // All /api requests are forwarded to the Express backend.
            // This lets the frontend use relative paths without CORS issues in dev.
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
