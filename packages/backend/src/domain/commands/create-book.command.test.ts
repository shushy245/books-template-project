import { beforeEach, describe, expect, it } from 'vitest';

import { OutboxEventType, ReadingStatus } from '@reading-room/common';

import { NotFoundError } from '../errors/index.js';
import { FakeShelfRepository } from '../../testing/fake-shelf.repository.js';
import { FakeUnitOfWork } from '../../testing/fake-unit-of-work.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';
import { createBook } from './create-book.command.js';

type CreateBookDriver = {
    seedShelf: (shelfId: string) => void;
    create: (overrides?: { shelfId?: string }) => Promise<void>;
    assertBookPersisted: () => Promise<void>;
    assertOutboxEvent: (type: OutboxEventType) => void;
    assertSameUnitOfWork: () => Promise<void>;
    assertRejectsWithNotFound: (fn: () => Promise<unknown>) => Promise<void>;
};

const makeCreateBookDriver = (): CreateBookDriver => {
    const shelfRepo = new FakeShelfRepository();
    const uow = new FakeUnitOfWork();
    const logger = makeFakeLogger();

    const deps = { shelfRepo, unitOfWork: uow, logger };

    const defaultDto = { title: 'Dune', authorId: 'author-1', shelfId: 'shelf-1', status: ReadingStatus.WantToRead };

    return {
        seedShelf: (shelfId) => {
            shelfRepo.seed({ id: shelfId, name: 'Test Shelf', createdAt: new Date(), updatedAt: new Date() });
        },

        create: async (overrides = {}) => {
            await createBook(deps, { ...defaultDto, ...overrides });
        },

        assertBookPersisted: async () => {
            const result = await uow.bookRepo.list({});
            expect(result.total).toBeGreaterThan(0);
        },

        assertOutboxEvent: (type) => {
            const event = uow.outboxRepo.events.find((e) => e.type === type);
            expect(event).toBeDefined();
        },

        assertSameUnitOfWork: async () => {
            const result = await uow.bookRepo.list({});
            expect(result.total).toBeGreaterThan(0);
            expect(uow.outboxRepo.events.length).toBeGreaterThan(0);
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

    it('writes the book and outbox event via the same unit of work', async () => {
        driver.seedShelf('shelf-1');

        await driver.create();

        await driver.assertSameUnitOfWork();
    });

    it('throws NotFoundError with a descriptive message when the shelf does not exist', async () => {
        await driver.assertRejectsWithNotFound(() => driver.create({ shelfId: 'missing-shelf' }));
    });
});
