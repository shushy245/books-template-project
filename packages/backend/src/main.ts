// main.ts — composition root.
// This is the only place real adapters are wired.
// buildApp() takes deps and remains testable without this file.
import { buildApp } from './app.js';
import { Store } from './adapters/store.js';
import { createDb } from './db/client.js';
import { startOutboxRelay } from './outbox-relay/outbox-relay.js';

// TODO (S8 T8.1): replace with the real OTel-backed structured logger.
const logger = {
    info: (ctx: Record<string, unknown>, message: string, fields?: Record<string, unknown>): void => {
        console.log(JSON.stringify({ level: 'info', ...ctx, message, ...fields }));
    },
    warn: (ctx: Record<string, unknown>, message: string, fields?: Record<string, unknown>): void => {
        console.warn(JSON.stringify({ level: 'warn', ...ctx, message, ...fields }));
    },
    error: (ctx: Record<string, unknown>, message: string, fields?: Record<string, unknown>): void => {
        console.error(JSON.stringify({ level: 'error', ...ctx, message, ...fields }));
    },
};

const { db } = createDb({
    host: process.env['DB_HOST'] ?? 'localhost',
    port: Number(process.env['DB_PORT'] ?? 5434),
    user: process.env['DB_USER'] ?? 'reading_room',
    password: process.env['DB_PASSWORD'] ?? 'reading_room',
    database: process.env['DB_NAME'] ?? 'reading_room',
});

const store = new Store(db);
const app = buildApp({ store, logger });
const port = Number(process.env['PORT'] ?? 3000);

const rawRelayInterval = process.env['OUTBOX_RELAY_INTERVAL_MS'];
const relayIntervalMs = rawRelayInterval !== undefined && rawRelayInterval !== '' ? Number(rawRelayInterval) : 5000;
const stopRelay = startOutboxRelay({ store, logger }, { intervalMs: relayIntervalMs });
logger.info({ intervalMs: relayIntervalMs }, 'main: outbox relay started');

app.listen(port, () => {
    logger.info({ port }, 'main: server started');
});

const shutdown = async (signal: string): Promise<void> => {
    logger.info({}, `main: ${signal} received, draining relay`);
    await stopRelay();
    process.exit(0);
};

process.on('SIGTERM', () => {
    shutdown('SIGTERM').catch(console.error);
});
process.on('SIGINT', () => {
    shutdown('SIGINT').catch(console.error);
});
