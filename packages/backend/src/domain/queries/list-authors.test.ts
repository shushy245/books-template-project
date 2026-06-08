import { beforeEach, describe, it } from 'vitest';

import { ListAuthorsDriver, makeListAuthorsDriver } from './list-authors.driver.js';

describe('listAuthors', () => {
    let driver: ListAuthorsDriver;

    beforeEach(() => {
        driver = makeListAuthorsDriver();
    });

    it('returns an empty list when there are no authors', async () => {
        const result = await driver.get.list();

        driver.assert.names(result, []);
    });

    it('returns every author', async () => {
        await driver.given.author('Le Guin');
        await driver.given.author('Herbert');

        const result = await driver.get.list();

        driver.assert.names(result, ['Le Guin', 'Herbert']);
    });
});
