import { expect } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { FakeStore } from '../testing/fake-store.js';
import { makeFakeLogger } from '../testing/fake-logger.js';
import { pollOutbox } from './outbox-relay.js';

export type OutboxRelayDriver = {
    given: {
        unprocessedEvent: (type: OutboxEventType, aggregateId?: string) => Promise<string>;
        failingMarkProcessedFor: (outboxId: string) => void;
    };
    when: {
        poll: () => Promise<void>;
    };
    assert: {
        noUnprocessedEvents: () => Promise<void>;
        unprocessedCount: (count: number) => Promise<void>;
        loggedDispatch: (type: OutboxEventType) => void;
        loggedError: (outboxId: string) => void;
    };
};

export const makeOutboxRelayDriver = (): OutboxRelayDriver => {
    const store = new FakeStore();
    const logger = makeFakeLogger();

    return {
        given: {
            unprocessedEvent: async (type, aggregateId = 'aggregate-1') => {
                await store.outbox.append({
                    aggregateId,
                    type,
                    payload: { bookId: aggregateId },
                });
                const records = await store.outbox.fetchUnprocessed();
                const last = records[records.length - 1];
                if (last === undefined) throw new Error('outbox relay driver: append produced no record');

                return last.id;
            },

            failingMarkProcessedFor: (outboxId) => {
                store.outbox.failOnMarkProcessed.add(outboxId);
            },
        },

        when: {
            poll: async () => {
                await pollOutbox({ store, logger });
            },
        },

        assert: {
            noUnprocessedEvents: async () => {
                const remaining = await store.outbox.fetchUnprocessed();
                expect(remaining).toHaveLength(0);
            },

            unprocessedCount: async (count) => {
                const remaining = await store.outbox.fetchUnprocessed();
                expect(remaining).toHaveLength(count);
            },

            loggedDispatch: (type) => {
                const dispatched = logger.entries.find(
                    (e) => e.message === 'pollOutbox: dispatching' && e.fields?.['type'] === type,
                );
                expect(dispatched).toBeDefined();
            },

            loggedError: (outboxId) => {
                const entry = logger.entries.find(
                    (e) => e.level === 'error' && e.fields?.['outboxId'] === outboxId,
                );
                expect(entry).toBeDefined();
            },
        },
    };
};
