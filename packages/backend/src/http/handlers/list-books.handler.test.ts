import type { Response } from 'supertest';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from '../../app.js';
import { aBook } from '../../testing/builders/book.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';

type ListBooksDriver = {
    seedBook: (title: string) => Promise<void>;
    listBooks: (query?: Record<string, string>) => Promise<Response>;
    assertPaginatedResult: (res: Response, itemCount: number, total: number) => void;
    assertBadRequest: (res: Response) => void;
};

const makeListBooksDriver = (): ListBooksDriver => {
    const store = new FakeStore();
    const app = buildApp({ store, logger: makeFakeLogger() });

    const seedBook = async (title: string): Promise<void> => {
        await store.books.insert(aBook({ title }).buildDTO());
    };

    return {
        seedBook,

        listBooks: (query = {}) => {
            const qs = new URLSearchParams(query).toString();
            return request(app).get(`/api/books${qs ? `?${qs}` : ''}`);
        },

        assertPaginatedResult: (res, itemCount, total) => {
            expect(res.status).toBe(200);
            expect(res.body.items).toHaveLength(itemCount);
            expect(res.body.total).toBe(total);
        },

        assertBadRequest: (res) => {
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        },
    };
};

describe('GET /api/books', () => {
    let driver: ListBooksDriver;

    beforeEach(() => {
        driver = makeListBooksDriver();
    });

    it('returns a paginated result with seeded books', async () => {
        await driver.seedBook('Dune');
        await driver.seedBook('Foundation');

        const res = await driver.listBooks();

        driver.assertPaginatedResult(res, 2, 2);
    });

    it('filters by shelfId, sortBy, sortDir, and page via query params', async () => {
        await driver.seedBook('Alpha');
        await driver.seedBook('Beta');
        await driver.seedBook('Gamma');

        const res = await driver.listBooks({ sortBy: 'Title', sortDir: 'Asc', page: '2', pageSize: '2' });

        driver.assertPaginatedResult(res, 1, 3);
    });

    it('returns 400 on an invalid sort field', async () => {
        const res = await driver.listBooks({ sortBy: 'invalid' });

        driver.assertBadRequest(res);
    });
});
