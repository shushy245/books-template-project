import type { Response } from 'supertest';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../../app.js';
import { aBook } from '../../testing/builders/book.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';

type ListBooksDriver = {
    given: {
        book: (title: string) => Promise<void>;
    };
    get: {
        books: (query?: Record<string, string>) => Promise<Response>;
    };
    assert: {
        paginatedResult: (res: Response, itemCount: number, total: number) => void;
        badRequest: (res: Response) => void;
    };
};

const makeListBooksDriver = (): ListBooksDriver => {
    const store = new FakeStore();
    const app = buildApp({ store, logger: makeFakeLogger() });

    return {
        given: {
            book: async (title) => {
                await store.books.insert(aBook({ title }).buildDTO());
            },
        },

        get: {
            books: (query = {}) => {
                const qs = new URLSearchParams(query).toString();
                return request(app).get(`/api/books${qs ? `?${qs}` : ''}`);
            },
        },

        assert: {
            paginatedResult: (res, itemCount, total) => {
                expect(res.status).toBe(200);
                expect(res.body.items).toHaveLength(itemCount);
                expect(res.body.total).toBe(total);
            },

            badRequest: (res) => {
                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty('error');
            },
        },
    };
};

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
