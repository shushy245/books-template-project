import { beforeEach, describe, it } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { CreateBookDriver, makeCreateBookDriver } from './create-book.driver.js';

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
