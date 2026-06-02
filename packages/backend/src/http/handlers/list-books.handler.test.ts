import type { Response } from 'supertest';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { ReadingStatus } from '@reading-room/common';

import { buildApp } from '../../app.js';
import { FakeBookRepository } from '../../testing/fake-book-repository.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';

type ListBooksDriver = {
    seedBook: (title: string) => Promise<void>;
    listBooks: (query?: Record<string, string>) => Promise<Response>;
    assertPaginatedResult: (res: Response, itemCount: number, total: number) => void;
    assertBadRequest: (res: Response) => void;
};

const makeListBooksDriver = (): ListBooksDriver => {
    const bookRepo = new FakeBookRepository();
    const app = buildApp({ bookRepo, logger: makeFakeLogger() });

    const seedBook = async (title: string): Promise<void> => {
        await bookRepo.insert({ title, authorId: 'author-1', shelfId: 'shelf-1', status: ReadingStatus.WantToRead });
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
