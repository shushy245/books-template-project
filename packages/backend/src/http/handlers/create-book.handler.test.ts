import { beforeEach, describe, it } from 'vitest';

import { CreateBookDriver, makeCreateBookDriver } from './create-book.handler.driver.js';

describe('POST /api/books', () => {
    let driver: CreateBookDriver;

    beforeEach(() => {
        driver = makeCreateBookDriver();
    });

    it('creates the book and returns 201 when the shelf and author exist', async () => {
        driver.given.shelf();
        driver.given.author();

        const res = await driver.post.book();

        driver.assert.created(res, 'Dune');
    });

    it('returns 400 when the title is empty', async () => {
        driver.given.shelf();
        driver.given.author();

        const res = await driver.post.book({ title: '' });

        driver.assert.badRequest(res);
    });

    it('returns 400 when authorId is not a valid uuid', async () => {
        const res = await driver.post.book({ authorId: 'not-a-uuid' });

        driver.assert.badRequest(res);
    });

    it('returns 404 when the shelf does not exist', async () => {
        driver.given.author();

        const res = await driver.post.book();

        driver.assert.notFound(res);
    });

    it('returns 404 when the author does not exist', async () => {
        driver.given.shelf();

        const res = await driver.post.book();

        driver.assert.notFound(res);
    });
});
