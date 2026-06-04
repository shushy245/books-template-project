import { expect } from 'vitest';
import { OutboxEventType } from '@reading-room/common';

import { aBook } from '../../testing/builders/book.js';
import { aShelf } from '../../testing/builders/shelf.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';
import { NotFoundError } from '../errors/index.js';
import { createBook } from './create-book.js';

export type CreateBookDriver = {
    given: {
        shelf: (shelfId?: string) => void;
    };
    when: {
        create: (overrides?: { shelfId?: string }) => Promise<void>;
    };
    assert: {
        bookPersisted: () => Promise<void>;
        outboxEvent: (type: OutboxEventType) => void;
        throwsNotFound: (fn: () => Promise<unknown>) => Promise<void>;
    };
};

export const makeCreateBookDriver = (): CreateBookDriver => {
    const store = new FakeStore();
    const logger = makeFakeLogger();

    return {
        given: {
            shelf: (shelfId = 'shelf-1') => {
                store.shelves.seed(aShelf({ id: shelfId }).build());
            },
        },

        when: {
            create: async (overrides = {}) => {
                await createBook(
                    { store, logger },
                    aBook({ title: 'Dune', shelfId: 'shelf-1', ...overrides }).buildDTO(),
                );
            },
        },

        assert: {
            bookPersisted: async () => {
                const result = await store.books.list({});
                expect(result.total).toBeGreaterThan(0);
            },

            outboxEvent: (type) => {
                expect(store.outbox.events.find((e) => e.type === type)).toBeDefined();
            },

            throwsNotFound: async (fn) => {
                await expect(fn()).rejects.toThrow(NotFoundError);
            },
        },
    };
};
