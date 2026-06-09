import { beforeEach, describe, it } from 'vitest';

import { DeleteBookDriver, makeDeleteBookDriver } from './delete-book.driver.ts';

describe('deleteBook', () => {
    let driver: DeleteBookDriver;

    beforeEach(() => {
        driver = makeDeleteBookDriver();
    });

    it('removes the book from the store', async () => {
        await driver.given.book();

        await driver.when.delete();

        await driver.assert.bookGone();
    });

    it('appends a BookDeleted outbox event', async () => {
        await driver.given.book();

        await driver.when.delete();

        driver.assert.outboxEvent();
    });

    it('throws NotFoundError when the book does not exist', async () => {
        await driver.assert.throwsNotFound(() => driver.when.delete('nonexistent-id'));
    });
});
