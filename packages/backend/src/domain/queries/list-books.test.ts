import { beforeEach, describe, it } from 'vitest';

import { BookSortField, SortDirection } from '@reading-room/common';

import { ListBooksDriver, makeListBooksDriver } from './list-books.driver.ts';

describe('listBooks', () => {
    let driver: ListBooksDriver;

    beforeEach(() => {
        driver = makeListBooksDriver();
    });

    it('returns books newest-first by default', async () => {
        await driver.given.book('First');
        await driver.given.book('Second');

        const result = await driver.get.list();

        driver.assert.titlesInOrder(result, ['Second', 'First']);
    });

    it('filters by shelf — only returns books on that shelf', async () => {
        await driver.given.book('On Shelf A', 'shelf-a');
        await driver.given.book('On Shelf B', 'shelf-b');

        const result = await driver.get.list({ shelfId: 'shelf-a' });

        driver.assert.titlesInOrder(result, ['On Shelf A']);
        driver.assert.total(result, 1);
    });

    it('page 2 returns the next slice', async () => {
        await driver.given.book('A');
        await driver.given.book('B');
        await driver.given.book('C');

        const result = await driver.get.list({
            sortBy: BookSortField.Title,
            sortDir: SortDirection.Asc,
            page: 2,
            pageSize: 2,
        });

        driver.assert.titlesInOrder(result, ['C']);
        driver.assert.total(result, 3);
        driver.assert.page(result, 2);
    });
});
