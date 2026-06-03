import { beforeEach, describe, expect, it } from 'vitest';

import { Book, ReadingStatus, UpdateBookDto } from '@reading-room/common';

import { aBook } from '../../testing/builders/book.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';
import { ConflictError, NotFoundError, RuleError } from '../errors/index.js';
import { updateBook } from './update-book.js';

type UpdateBookDriver = {
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

const makeUpdateBookDriver = (): UpdateBookDriver => {
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

describe('updateBook', () => {
    let driver: UpdateBookDriver;

    beforeEach(() => {
        driver = makeUpdateBookDriver();
    });

    it('updates the status when the transition is valid', async () => {
        await driver.given.book(ReadingStatus.WantToRead);

        await driver.when.update({ status: ReadingStatus.Reading });

        driver.assert.status(ReadingStatus.Reading);
    });

    it('updates the rating when the book is already in Read status', async () => {
        await driver.given.book(ReadingStatus.Read);

        await driver.when.update({ rating: 5 });

        driver.assert.rating(5);
    });

    it('allows setting rating when transitioning to Read in the same update', async () => {
        await driver.given.book(ReadingStatus.Reading);

        await driver.when.update({ status: ReadingStatus.Read, rating: 4 });

        driver.assert.status(ReadingStatus.Read);
        driver.assert.rating(4);
    });

    it('throws RuleError when the status transition is invalid', async () => {
        await driver.given.book(ReadingStatus.WantToRead);

        await driver.assert.throwsRule(() => driver.when.update({ status: ReadingStatus.Read }));
    });

    it('throws RuleError when rating is provided for a non-Read book', async () => {
        await driver.given.book(ReadingStatus.Reading);

        await driver.assert.throwsRule(() => driver.when.update({ rating: 4 }));
    });

    it('throws NotFoundError when the book does not exist', async () => {
        await driver.assert.throwsNotFound(() => driver.when.update({ id: 'nonexistent', updatedAt: new Date() }));
    });

    it('throws ConflictError on a stale optimistic lock token', async () => {
        await driver.given.book();

        await driver.assert.throwsConflict(() => driver.when.update({ updatedAt: new Date(0) }));
    });
});
