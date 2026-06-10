import { beforeEach, describe, it } from 'vitest';
import { OutboxEventType } from '@reading-room/common';

import { CreateBookDriver, makeCreateBookDriver } from './create-book.driver.ts';

describe('createBook', () => {
    let driver: CreateBookDriver;

    beforeEach(() => {
        driver = makeCreateBookDriver();
    });

    it('persists the book when the shelf and author exist', async () => {
        driver.given.shelf();
        driver.given.author();

        await driver.when.create();

        await driver.assert.bookPersisted();
    });

    it('records a BookCreated outbox event', async () => {
        driver.given.shelf();
        driver.given.author();

        await driver.when.create();

        driver.assert.outboxEvent(OutboxEventType.BookCreated);
    });

    it('throws NotFoundError when the shelf does not exist', async () => {
        driver.given.author();

        await driver.assert.throwsNotFound(() => driver.when.create({ shelfId: 'missing-shelf' }));
    });

    it('throws NotFoundError when the author does not exist', async () => {
        driver.given.shelf();

        await driver.assert.throwsNotFound(() => driver.when.create({ authorId: 'missing-author' }));
    });
});
