import { expect } from 'vitest';
import type { Response } from 'supertest';
import request from 'supertest';

import { buildApp } from '../../app.ts';
import { aBook } from '../../testing/builders/book.ts';
import { FakeStore } from '../../testing/fake-store.ts';
import { makeFakeLogger } from '../../testing/fake-logger.ts';

export type ListBooksDriver = {
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

export const makeListBooksDriver = (): ListBooksDriver => {
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
