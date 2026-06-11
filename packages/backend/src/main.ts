// main.ts — composition root.
// This is the only place real adapters are wired.
// buildApp() takes deps and remains testable without this file.
import { buildApp } from './app.ts';
import { config } from './config.ts';
import { createDb } from './db/client.ts';
import { Store } from './adapters/store.ts';
import { startOutboxRelay } from './outbox-relay/outbox-relay.ts';
import { LoggingEventDispatcher } from './adapters/outbox/logging-event-dispatcher.ts';

// Swap point: replace with your OTel exporter here. LoggerPort is the contract; this console adapter is the default.
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
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
});

const store = new Store(db);
const dispatcher = new LoggingEventDispatcher(logger);
const app = buildApp({ store, logger });
const stopRelay = startOutboxRelay({ store, dispatcher, logger }, { intervalMs: config.OUTBOX_RELAY_INTERVAL_MS });
logger.info({ intervalMs: config.OUTBOX_RELAY_INTERVAL_MS }, 'main: outbox relay started');

app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, 'main: server started');
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
