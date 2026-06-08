import { beforeEach, describe, it } from 'vitest';

import { ListAuthorsDriver, makeListAuthorsDriver } from './list-authors.handler.driver.js';

describe('GET /api/authors', () => {
    let driver: ListAuthorsDriver;

    beforeEach(() => {
        driver = makeListAuthorsDriver();
    });

    it('returns an empty array when there are no authors', async () => {
        const res = await driver.get.authors();

        driver.assert.names(res, []);
    });

    it('returns every seeded author', async () => {
        await driver.given.author('Le Guin');
        await driver.given.author('Herbert');

        const res = await driver.get.authors();

        driver.assert.names(res, ['Le Guin', 'Herbert']);
    });
});
