import { beforeEach, describe, it } from 'vitest';

import { ListShelvesDriver, makeListShelvesDriver } from './list-shelves.handler.driver.ts';

describe('GET /api/shelves', () => {
    let driver: ListShelvesDriver;

    beforeEach(() => {
        driver = makeListShelvesDriver();
    });

    it('returns an empty array when there are no shelves', async () => {
        const res = await driver.get.shelves();

        driver.assert.names(res, []);
    });

    it('returns every seeded shelf', async () => {
        await driver.given.shelf('Sci-Fi');
        await driver.given.shelf('Fantasy');

        const res = await driver.get.shelves();

        driver.assert.names(res, ['Sci-Fi', 'Fantasy']);
    });
});
