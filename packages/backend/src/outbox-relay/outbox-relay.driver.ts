import { expect } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { FakeStore } from '../testing/fake-store.js';
import { FakeEventDispatcher } from '../testing/fake-event-dispatcher.js';
import { makeFakeLogger } from '../testing/fake-logger.js';
import { pollOutbox } from './outbox-relay.js';

export type OutboxRelayDriver = {
    given: {
        unprocessedEvent: (type: OutboxEventType, aggregateId?: string) => Promise<string>;
        failingDispatchFor: (outboxId: string) => void;
    };
    when: {
        poll: () => Promise<void>;
    };
    assert: {
        dispatched: (type: OutboxEventType) => void;
        noUnprocessedEvents: () => Promise<void>;
        unprocessedCount: (count: number) => Promise<void>;
        deliveryCount: (outboxId: string, count: number) => Promise<void>;
        deadLettered: (outboxId: string, deliveryCount: number) => void;
        loggedProcessed: (type: OutboxEventType) => void;
        loggedWarn: (outboxId: string) => void;
        loggedError: (outboxId: string) => void;
    };
};

export const makeOutboxRelayDriver = ({ maxRetries = 10 }: { maxRetries?: number } = {}): OutboxRelayDriver => {
    const store = new FakeStore();
    const dispatcher = new FakeEventDispatcher();
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

            failingDispatchFor: (outboxId) => {
                dispatcher.failFor.add(outboxId);
            },
        },

        when: {
            poll: async () => {
                await pollOutbox({ store, dispatcher, logger }, { maxRetries });
            },
        },

        assert: {
            dispatched: (type) => {
                const event = dispatcher.events.find((e) => e.type === type);
                expect(event).toBeDefined();
            },

            noUnprocessedEvents: async () => {
                const remaining = await store.outbox.fetchUnprocessed();
                expect(remaining).toHaveLength(0);
            },

            unprocessedCount: async (count) => {
                const remaining = await store.outbox.fetchUnprocessed();
                expect(remaining).toHaveLength(count);
            },

            deliveryCount: async (outboxId, count) => {
                const remaining = await store.outbox.fetchUnprocessed();
                const record = remaining.find((r) => r.id === outboxId);
                expect(record?.deliveryCount).toBe(count);
            },

            deadLettered: (outboxId, deliveryCount) => {
                const entry = store.deadLetters.entries.find((e) => e.outboxId === outboxId);
                expect(entry).toBeDefined();
                expect(entry?.deliveryCount).toBe(deliveryCount);
            },

            loggedProcessed: (type) => {
                const entry = logger.entries.find(
                    (e) => e.message === 'pollOutbox: processing' && e.fields?.['type'] === type,
                );
                expect(entry).toBeDefined();
            },

            loggedWarn: (outboxId) => {
                const entry = logger.entries.find((e) => e.level === 'warn' && e.fields?.['outboxId'] === outboxId);
                expect(entry).toBeDefined();
            },

            loggedError: (outboxId) => {
                const entry = logger.entries.find((e) => e.level === 'error' && e.fields?.['outboxId'] === outboxId);
                expect(entry).toBeDefined();
            },
        },
    };
};
