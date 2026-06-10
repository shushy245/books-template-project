import { LoggerPort } from '../telemetry/logger.port.ts';
import { StorePort } from '../domain/ports/store.port.ts';
import { OutboxRecord } from '../domain/ports/outbox-repository.port.ts';
import { EventDispatcherPort } from '../domain/ports/event-dispatcher.port.ts';

type OutboxRelayDeps = {
    store: StorePort;
    dispatcher: EventDispatcherPort;
    logger: LoggerPort;
};

type PollOptions = {
    maxRetries?: number;
};

const DEFAULT_MAX_RETRIES = 10;

export const pollOutbox = async (
    { store, dispatcher, logger }: OutboxRelayDeps,
    { maxRetries = DEFAULT_MAX_RETRIES }: PollOptions = {},
): Promise<void> => {
    const records = await store.outbox.fetchUnprocessed();

    logger.info({}, 'pollOutbox: poll', { count: records.length });

    for (const record of records) {
        logger.info({}, 'pollOutbox: processing', {
            outboxId: record.id,
            aggregateId: record.aggregateId,
            type: record.type,
            deliveryCount: record.deliveryCount,
        });

        // Only the dispatch is guarded by the failure path. markProcessed runs after a
        // confirmed dispatch — if it throws, the event is simply re-dispatched next poll
        // (consumers are idempotent) rather than being counted as a dispatch failure.
        try {
            await dispatcher.dispatch(record);
        } catch (err: unknown) {
            await handleDispatchFailure({ store, logger }, record, maxRetries, err);
            continue;
        }

        await store.outbox.markProcessed(record.id);

        logger.info({}, 'pollOutbox: dispatched', { outboxId: record.id });
    }
};

// Bounded redelivery: each failed dispatch bumps the delivery count; once it reaches
// the limit the event is dead-lettered (parked in dlq_event, marked processed so the
// relay stops retrying it) rather than looping forever.
const handleDispatchFailure = async (
    { store, logger }: Pick<OutboxRelayDeps, 'store' | 'logger'>,
    record: OutboxRecord,
    maxRetries: number,
    err: unknown,
): Promise<void> => {
    const deliveryCount = record.deliveryCount + 1;

    if (deliveryCount >= maxRetries) {
        logger.error({}, 'pollOutbox: dead-lettering event after retry limit', {
            outboxId: record.id,
            deliveryCount,
            maxRetries,
            error: String(err),
        });
        // Park and mark-processed atomically: a crash between the two would otherwise
        // re-dispatch the event next poll and append a duplicate dlq_event row.
        await store.transaction(async ({ outbox, deadLetters }) => {
            await deadLetters.append({
                outboxId: record.id,
                aggregateId: record.aggregateId,
                type: record.type,
                payload: record.payload,
                deliveryCount,
                error: String(err),
            });
            await outbox.markProcessed(record.id);
        });

        return;
    }

    logger.warn({}, 'pollOutbox: dispatch failed, will retry', {
        outboxId: record.id,
        deliveryCount,
        maxRetries,
        error: String(err),
    });

    await store.outbox.incrementDeliveryCount(record.id);
};

export const startOutboxRelay = (
    deps: OutboxRelayDeps,
    { intervalMs = 5000 }: { intervalMs?: number } = {},
): (() => Promise<void>) => {
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
