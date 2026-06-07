import { LoggerPort } from '../telemetry/logger.port.js';
import { StorePort } from '../domain/ports/store.port.js';

type OutboxRelayDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const pollOutbox = async ({ store, logger }: OutboxRelayDeps): Promise<void> => {
    const records = await store.outbox.fetchUnprocessed();

    logger.info({}, 'pollOutbox: poll', { count: records.length });

    for (const record of records) {
        logger.info({}, `pollOutbox: dispatching ${record.type}`, {
            outboxId: record.id,
            aggregateId: record.aggregateId,
            type: record.type,
        });

        await store.outbox.markProcessed(record.id);

        logger.info({}, 'pollOutbox: marked processed', { outboxId: record.id });
    }
};

export const startOutboxRelay = (deps: OutboxRelayDeps, { intervalMs = 5000 }: { intervalMs?: number } = {}): () => void => {
    const handle = setInterval(() => {
        pollOutbox(deps).catch((err: unknown) => {
            deps.logger.error({}, 'pollOutbox: poll error', { error: String(err) });
        });
    }, intervalMs);

    return () => clearInterval(handle);
};
