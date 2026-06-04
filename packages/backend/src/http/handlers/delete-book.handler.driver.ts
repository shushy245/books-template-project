import { expect } from 'vitest';
import type { Response } from 'supertest';
import request from 'supertest';

import { buildApp } from '../../app.js';
import { aBook } from '../../testing/builders/book.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';

export type DeleteBookDriver = {
    given: {
        book: () => Promise<void>;
    };
    del: {
        book: () => Promise<Response>;
        withId: (id: string) => Promise<Response>;
    };
    assert: {
        deleted: (res: Response) => void;
        notFound: (res: Response) => void;
        badRequest: (res: Response) => void;
    };
};

export const makeDeleteBookDriver = (): DeleteBookDriver => {
    const store = new FakeStore();
    const app = buildApp({ store, logger: makeFakeLogger() });
    let lastBookId: string | undefined;

    const bookId = (): string => {
        if (lastBookId === undefined) throw new Error('driver: call given.book() first');

        return lastBookId;
    };

    return {
        given: {
            book: async () => {
                const book = await store.books.insert(aBook().buildDTO());
                lastBookId = book.id;
            },
        },

        del: {
            book: () => request(app).delete(`/api/books/${bookId()}`),
            withId: (id) => request(app).delete(`/api/books/${id}`),
        },

        assert: {
            deleted: (res) => {
                expect(res.status).toBe(204);
            },

            notFound: (res) => {
                expect(res.status).toBe(404);
                expect(res.body).toHaveProperty('error');
            },

            badRequest: (res) => {
                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty('error');
            },
        },
    };
};
