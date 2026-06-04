import { beforeEach, describe, it } from 'vitest';

import { ListBooksDriver, makeListBooksDriver } from './list-books.handler.driver.js';

describe('GET /api/books', () => {
    let driver: ListBooksDriver;

    beforeEach(() => {
        driver = makeListBooksDriver();
    });

    it('returns a paginated result with seeded books', async () => {
        await driver.given.book('Dune');
        await driver.given.book('Foundation');

        const res = await driver.get.books();

        driver.assert.paginatedResult(res, 2, 2);
    });

    it('filters by shelfId, sortBy, sortDir, and page via query params', async () => {
        await driver.given.book('Alpha');
        await driver.given.book('Beta');
        await driver.given.book('Gamma');

        const res = await driver.get.books({ sortBy: 'Title', sortDir: 'Asc', page: '2', pageSize: '2' });

        driver.assert.paginatedResult(res, 1, 3);
    });

    it('returns 400 on an invalid sort field', async () => {
        const res = await driver.get.books({ sortBy: 'invalid' });

        driver.assert.badRequest(res);
    });
});
