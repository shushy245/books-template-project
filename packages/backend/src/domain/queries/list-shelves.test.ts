import { beforeEach, describe, it } from 'vitest';

import { ListShelvesDriver, makeListShelvesDriver } from './list-shelves.driver.js';

describe('listShelves', () => {
    let driver: ListShelvesDriver;

    beforeEach(() => {
        driver = makeListShelvesDriver();
    });

    it('returns an empty list when there are no shelves', async () => {
        const result = await driver.get.list();

        driver.assert.names(result, []);
    });

    it('returns every shelf', async () => {
        await driver.given.shelf('Sci-Fi');
        await driver.given.shelf('Fantasy');

        const result = await driver.get.list();

        driver.assert.names(result, ['Sci-Fi', 'Fantasy']);
    });
});
