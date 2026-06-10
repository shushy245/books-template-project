import { expect } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { aBook } from '../../testing/builders/index.ts';
import { FakeStore } from '../../testing/fake-store.ts';
import { makeFakeLogger } from '../../testing/fake-logger.ts';
import { NotFoundError } from '../errors/index.ts';
import { deleteBook } from './delete-book.ts';

export type DeleteBookDriver = {
    given: {
        book: () => Promise<void>;
    };
    when: {
        delete: (id?: string) => Promise<void>;
    };
    assert: {
        bookGone: () => Promise<void>;
        outboxEvent: () => void;
        throwsNotFound: (fn: () => Promise<unknown>) => Promise<void>;
    };
};

export const makeDeleteBookDriver = (): DeleteBookDriver => {
    const store = new FakeStore();
    const logger = makeFakeLogger();
    let lastBookId: string | undefined;

    const requireBookId = (): string => {
        if (lastBookId === undefined) throw new Error('deleteBook driver: call given.book() first');

        return lastBookId;
    };

    return {
        given: {
            book: async () => {
                const book = await store.books.insert(aBook().buildDTO());
                lastBookId = book.id;
            },
        },

        when: {
            delete: async (id) => {
                await deleteBook({ store, logger }, id ?? requireBookId());
            },
        },

        assert: {
            bookGone: async () => {
                const result = await store.books.findById(requireBookId());
                expect(result).toBeUndefined();
            },

            outboxEvent: () => {
                expect(store.outbox.events.find((e) => e.type === OutboxEventType.BookDeleted)).toBeDefined();
            },

            throwsNotFound: async (fn) => {
                await expect(fn()).rejects.toThrow(NotFoundError);
            },
        },
    };
};
