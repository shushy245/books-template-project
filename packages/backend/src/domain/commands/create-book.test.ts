import { beforeEach, describe, expect, it } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { NotFoundError } from '../errors/index.js';
import { aBook } from '../../testing/builders/book.js';
import { aShelf } from '../../testing/builders/shelf.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';
import { createBook } from './create-book.js';

type CreateBookDriver = {
    seedShelf: (shelfId: string) => void;
    create: (overrides?: { shelfId?: string }) => Promise<void>;
    assertBookPersisted: () => Promise<void>;
    assertOutboxEvent: (type: OutboxEventType) => void;
    assertSameTransaction: () => Promise<void>;
    assertRejectsWithNotFound: (fn: () => Promise<unknown>) => Promise<void>;
};

const makeCreateBookDriver = (): CreateBookDriver => {
    const store = new FakeStore();
    const logger = makeFakeLogger();

    return {
        seedShelf: (shelfId) => {
            store.shelves.seed(aShelf({ id: shelfId }).build());
        },

        create: async (overrides = {}) => {
            await createBook({ store, logger }, aBook({ title: 'Dune', shelfId: 'shelf-1', ...overrides }).buildDTO());
        },

        assertBookPersisted: async () => {
            const result = await store.books.list({});
            expect(result.total).toBeGreaterThan(0);
        },

        assertOutboxEvent: (type) => {
            expect(store.outbox.events.find((e) => e.type === type)).toBeDefined();
        },

        assertSameTransaction: async () => {
            const result = await store.books.list({});
            expect(result.total).toBeGreaterThan(0);
            expect(store.outbox.events.length).toBeGreaterThan(0);
        },

        assertRejectsWithNotFound: async (fn) => {
            await expect(fn()).rejects.toThrow(NotFoundError);
        },
    };
};

describe('createBook', () => {
    let driver: CreateBookDriver;

    beforeEach(() => {
        driver = makeCreateBookDriver();
    });

    it('persists the book when the shelf exists', async () => {
        driver.seedShelf('shelf-1');

        await driver.create();

        await driver.assertBookPersisted();
    });

    it('records a BookCreated outbox event', async () => {
        driver.seedShelf('shelf-1');

        await driver.create();

        driver.assertOutboxEvent(OutboxEventType.BookCreated);
    });

    it('writes the book and outbox event in the same transaction', async () => {
        driver.seedShelf('shelf-1');

        await driver.create();

        await driver.assertSameTransaction();
    });

    it('throws NotFoundError with a descriptive message when the shelf does not exist', async () => {
        await driver.assertRejectsWithNotFound(() => driver.create({ shelfId: 'missing-shelf' }));
    });
});
