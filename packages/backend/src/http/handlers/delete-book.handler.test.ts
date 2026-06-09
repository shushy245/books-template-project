import { beforeEach, describe, it } from 'vitest';

import { DeleteBookDriver, makeDeleteBookDriver } from './delete-book.handler.driver.ts';

describe('DELETE /api/books/:id', () => {
    let driver: DeleteBookDriver;

    beforeEach(() => {
        driver = makeDeleteBookDriver();
    });

    it('returns 204 when the book exists', async () => {
        await driver.given.book();

        const res = await driver.del.book();

        driver.assert.deleted(res);
    });

    it('returns 404 when the book does not exist', async () => {
        const res = await driver.del.withId('00000000-0000-0000-0000-000000000000');

        driver.assert.notFound(res);
    });

    it('returns 400 when the id is not a valid uuid', async () => {
        const res = await driver.del.withId('not-a-uuid');

        driver.assert.badRequest(res);
    });
});
