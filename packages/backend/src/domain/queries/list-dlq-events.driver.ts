import { expect } from 'vitest';
import { OutboxEventType } from '@reading-room/common';

import { listDlqEvents } from './list-dlq-events.ts';
import { DlqEventRecord } from '../ports/dead-letter-store.port.ts';
import { FakeDeadLetterStore } from '../../testing/fake-dead-letter-store.ts';

export type ListDlqEventsDriver = {
    given: {
        dlqEntry: (outboxId: string, aggregateId: string) => Promise<void>;
    };
    get: {
        list: () => Promise<DlqEventRecord[]>;
    };
    assert: {
        count: (result: DlqEventRecord[], count: number) => void;
        outboxIds: (result: DlqEventRecord[], ids: string[]) => void;
    };
};

export const makeListDlqEventsDriver = (): ListDlqEventsDriver => {
    const deadLetters = new FakeDeadLetterStore();

    return {
        given: {
            dlqEntry: async (outboxId, aggregateId) => {
                await deadLetters.append({
                    outboxId,
                    aggregateId,
                    type: OutboxEventType.BookCreated,
                    payload: {},
                    deliveryCount: 10,
                    error: 'dispatch failed',
                });
            },
        },
        get: {
            list: () => listDlqEvents({ deadLetters }),
        },
        assert: {
            count: (result, count) => {
                expect(result).toHaveLength(count);
            },
            outboxIds: (result, ids) => {
                expect(result.map((r) => r.outboxId)).toEqual(ids);
            },
        },
    };
};
