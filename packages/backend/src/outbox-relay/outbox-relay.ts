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
        try {
            logger.info({}, 'pollOutbox: dispatching', {
                outboxId: record.id,
                aggregateId: record.aggregateId,
                type: record.type,
            });

            await store.outbox.markProcessed(record.id);

            logger.info({}, 'pollOutbox: marked processed', { outboxId: record.id });
        } catch (err: unknown) {
            logger.error({}, 'pollOutbox: failed to process record', {
                outboxId: record.id,
                error: String(err),
            });
        }
    }
};

export const startOutboxRelay = (deps: OutboxRelayDeps, { intervalMs = 5000 }: { intervalMs?: number } = {}): () => Promise<void> => {
    let polling = false;
    let currentPoll: Promise<void> = Promise.resolve();

    const handle = setInterval(() => {
        if (polling) return;
        polling = true;
        currentPoll = pollOutbox(deps)
            .catch((err: unknown) => {
                deps.logger.error({}, 'pollOutbox: poll error', { error: String(err) });
            })
            .finally(() => {
                polling = false;
            });
    }, intervalMs);

    return () => {
        clearInterval(handle);
        return currentPoll;
    };
};
