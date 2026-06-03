import { beforeEach, describe, expect, it } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { NotFoundError } from '../errors/index.js';
import { aBook } from '../../testing/builders/book.js';
import { aShelf } from '../../testing/builders/shelf.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';
import { createBook } from './create-book.js';

type CreateBookDriver = {
    given: {
        shelf: (shelfId?: string) => void;
    };
    when: {
        create: (overrides?: { shelfId?: string }) => Promise<void>;
    };
    assert: {
        bookPersisted: () => Promise<void>;
        outboxEvent: (type: OutboxEventType) => void;
        sameTransaction: () => Promise<void>;
        throwsNotFound: (fn: () => Promise<unknown>) => Promise<void>;
    };
};

const makeCreateBookDriver = (): CreateBookDriver => {
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

            sameTransaction: async () => {
                const result = await store.books.list({});
                expect(result.total).toBeGreaterThan(0);
                expect(store.outbox.events.length).toBeGreaterThan(0);
            },

            throwsNotFound: async (fn) => {
                await expect(fn()).rejects.toThrow(NotFoundError);
            },
        },
    };
};

describe('createBook', () => {
    let driver: CreateBookDriver;

    beforeEach(() => {
        driver = makeCreateBookDriver();
    });

    it('persists the book when the shelf exists', async () => {
        driver.given.shelf();

        await driver.when.create();

        await driver.assert.bookPersisted();
    });

    it('records a BookCreated outbox event', async () => {
        driver.given.shelf();

        await driver.when.create();

        driver.assert.outboxEvent(OutboxEventType.BookCreated);
    });

    it('writes the book and outbox event in the same transaction', async () => {
        driver.given.shelf();

        await driver.when.create();

        await driver.assert.sameTransaction();
    });

    it('throws NotFoundError when the shelf does not exist', async () => {
        await driver.assert.throwsNotFound(() => driver.when.create({ shelfId: 'missing-shelf' }));
    });
});
