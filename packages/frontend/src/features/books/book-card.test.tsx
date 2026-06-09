import { beforeEach, describe, it, vi } from 'vitest';

import { ReadingStatus } from '@reading-room/common';

import { BookCardDriver, makeBookCardDriver } from './book-card.driver.tsx';

vi.mock('../../api/books.api.ts');

describe('BookCard', () => {
    let driver: BookCardDriver;

    beforeEach(() => {
        driver = makeBookCardDriver();
    });

    it('renders the book title', async () => {
        driver.given.book({ title: 'Dune' });

        await driver.when.created();

        driver.assert.title('Dune');
    });

    it('clicking delete calls onDelete with the book id', async () => {
        driver.given.book({ id: 'book-42' });

        await driver.when.created();

        await driver.click.delete();

        driver.assert.onDeleteCalledWith('book-42');
    });

    it('status change updates the select immediately before patchBook resolves', async () => {
        driver.given.book({ status: ReadingStatus.WantToRead });
        driver.given.patchBookPending();

        await driver.when.created();

        await driver.select.status(ReadingStatus.Reading);

        driver.assert.status(ReadingStatus.Reading);

        await driver.when.resolvePatch({ status: ReadingStatus.Reading });
    });

    it('status change success: select reflects the value returned from patchBook', async () => {
        driver.given.book({ status: ReadingStatus.WantToRead });
        driver.given.patchBookResolvesWith({ status: ReadingStatus.Reading });

        await driver.when.created();

        await driver.select.status(ReadingStatus.Reading);

        await driver.assert.statusEventually(ReadingStatus.Reading);
    });

    it('status change rollback: select reverts to original status when patchBook rejects', async () => {
        driver.given.book({ status: ReadingStatus.WantToRead });
        driver.given.patchBookRejectsWith();

        await driver.when.created();

        await driver.select.status(ReadingStatus.Reading);

        await driver.assert.statusEventually(ReadingStatus.WantToRead);
    });
});
