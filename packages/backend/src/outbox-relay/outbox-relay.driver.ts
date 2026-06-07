import { expect } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { FakeStore } from '../testing/fake-store.js';
import { makeFakeLogger } from '../testing/fake-logger.js';
import { pollOutbox } from './outbox-relay.js';

export type OutboxRelayDriver = {
    given: {
        unprocessedEvent: (type: OutboxEventType) => Promise<void>;
    };
    when: {
        poll: () => Promise<void>;
    };
    assert: {
        noUnprocessedEvents: () => Promise<void>;
        unprocessedCount: (count: number) => Promise<void>;
        loggedDispatch: (type: OutboxEventType) => void;
    };
};

export const makeOutboxRelayDriver = (): OutboxRelayDriver => {
    const store = new FakeStore();
    const logger = makeFakeLogger();

    return {
        given: {
            unprocessedEvent: async (type) => {
                await store.outbox.append({
                    aggregateId: 'aggregate-1',
                    type,
                    payload: { bookId: 'aggregate-1' },
                });
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
                expect(logger.entries.some((e) => e.message.includes(type))).toBe(true);
            },
        },
    };
};
