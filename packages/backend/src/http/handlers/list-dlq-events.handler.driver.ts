import { expect } from 'vitest';
import request from 'supertest';
import type { Response } from 'supertest';
import { OutboxEventType } from '@reading-room/common';

import { buildApp } from '../../app.ts';
import { FakeStore } from '../../testing/fake-store.ts';
import { makeFakeLogger } from '../../testing/fake-logger.ts';

export type ListDlqEventsHandlerDriver = {
    given: {
        dlqEntry: (outboxId: string) => Promise<void>;
    };
    get: {
        dlq: () => Promise<Response>;
    };
    assert: {
        ok: (res: Response, count: number) => void;
    };
};

export const makeListDlqEventsHandlerDriver = (): ListDlqEventsHandlerDriver => {
    const store = new FakeStore();
    const app = buildApp({ store, logger: makeFakeLogger() });

    return {
        given: {
            dlqEntry: async (outboxId) => {
                await store.deadLetters.append({
                    outboxId,
                    aggregateId: 'book-1',
                    type: OutboxEventType.BookCreated,
                    payload: {},
                    deliveryCount: 10,
                    error: 'dispatch failed',
                });
            },
        },
        get: {
            dlq: () => request(app).get('/api/admin/dlq'),
        },
        assert: {
            ok: (res, count) => {
                expect(res.status).toBe(200);
                expect(res.body).toHaveLength(count);
            },
        },
    };
};
