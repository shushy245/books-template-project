import { beforeEach, describe, it } from 'vitest';

import { ReadingStatus } from '@reading-room/common';

import { UpdateBookDriver, makeUpdateBookDriver } from './update-book.handler.driver.ts';

describe('PATCH /api/books/:id', () => {
    let driver: UpdateBookDriver;

    beforeEach(() => {
        driver = makeUpdateBookDriver();
    });

    it('updates and returns the book on a valid status transition', async () => {
        await driver.given.book(ReadingStatus.WantToRead);

        const res = await driver.patch.book({ status: ReadingStatus.Reading });

        driver.assert.updated(res, { status: ReadingStatus.Reading });
    });

    it('updates the rating when the book is in Read status', async () => {
        await driver.given.book(ReadingStatus.Read);

        const res = await driver.patch.book({ rating: 5 });

        driver.assert.updated(res, { rating: 5 });
    });

    it('returns 404 when the book does not exist', async () => {
        const res = await driver.patch.withId('00000000-0000-0000-0000-000000000000', {
            updatedAt: new Date().toISOString(),
            status: ReadingStatus.Reading,
        });

        driver.assert.notFound(res);
    });

    it('returns 400 when updatedAt is missing from the body', async () => {
        const res = await driver.patch.withId('00000000-0000-0000-0000-000000000000', {
            status: ReadingStatus.Reading,
        });

        driver.assert.badRequest(res);
    });

    it('returns 400 when the id is not a valid uuid', async () => {
        const res = await driver.patch.withId('not-a-uuid', { updatedAt: new Date().toISOString() });

        driver.assert.badRequest(res);
    });

    it('returns 409 on a stale optimistic lock token', async () => {
        await driver.given.book();

        const res = await driver.patch.withStaleToken();

        driver.assert.conflict(res);
    });

    it('returns 422 on an invalid status transition', async () => {
        await driver.given.book(ReadingStatus.WantToRead);

        const res = await driver.patch.book({ status: ReadingStatus.Read });

        driver.assert.ruleViolation(res);
    });
});
