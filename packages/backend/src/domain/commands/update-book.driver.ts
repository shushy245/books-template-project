import { expect } from 'vitest';
import { Book, ReadingStatus, UpdateBookDto } from '@reading-room/common';

import { aBook } from '../../testing/builders/book.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';
import { ConflictError, NotFoundError, RuleError } from '../errors/index.js';
import { updateBook } from './update-book.js';

export type UpdateBookDriver = {
    given: {
        book: (status?: ReadingStatus) => Promise<void>;
    };
    when: {
        update: (overrides?: Partial<UpdateBookDto>) => Promise<void>;
    };
    assert: {
        status: (expected: ReadingStatus) => void;
        rating: (expected: number) => void;
        throwsRule: (fn: () => Promise<unknown>) => Promise<void>;
        throwsNotFound: (fn: () => Promise<unknown>) => Promise<void>;
        throwsConflict: (fn: () => Promise<unknown>) => Promise<void>;
    };
};

export const makeUpdateBookDriver = (): UpdateBookDriver => {
    const store = new FakeStore();
    const logger = makeFakeLogger();
    let lastBook: Book | undefined;

    const requireBook = (): Book => {
        if (lastBook === undefined) throw new Error('updateBook driver: call given.book() first');

        return lastBook;
    };

    return {
        given: {
            book: async (status = ReadingStatus.WantToRead) => {
                lastBook = await store.books.insert(aBook({ status }).buildDTO());
            },
        },

        when: {
            update: async (overrides = {}) => {
                const id = overrides.id ?? lastBook?.id;
                const updatedAt = overrides.updatedAt ?? lastBook?.updatedAt;
                if (id === undefined || updatedAt === undefined) {
                    throw new Error('updateBook driver: provide id + updatedAt or call given.book() first');
                }
                lastBook = await updateBook({ store, logger }, { id, updatedAt, ...overrides });
            },
        },

        assert: {
            status: (expected) => {
                expect(requireBook().status).toBe(expected);
            },

            rating: (expected) => {
                expect(requireBook().rating).toBe(expected);
            },

            throwsRule: async (fn) => {
                await expect(fn()).rejects.toThrow(RuleError);
            },

            throwsNotFound: async (fn) => {
                await expect(fn()).rejects.toThrow(NotFoundError);
            },

            throwsConflict: async (fn) => {
                await expect(fn()).rejects.toThrow(ConflictError);
            },
        },
    };
};
