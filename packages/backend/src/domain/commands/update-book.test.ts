import { beforeEach, describe, it } from 'vitest';

import { OutboxEventType, ReadingStatus } from '@reading-room/common';

import { UpdateBookDriver, makeUpdateBookDriver } from './update-book.driver.ts';

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

    it('records a BookUpdated outbox event on a successful update', async () => {
        await driver.given.book(ReadingStatus.WantToRead);

        await driver.when.update({ status: ReadingStatus.Reading });

        driver.assert.outboxEvent(OutboxEventType.BookUpdated);
    });
});
