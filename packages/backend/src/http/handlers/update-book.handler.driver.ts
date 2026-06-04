import { expect } from 'vitest';
import type { Response } from 'supertest';
import request from 'supertest';

import { Book, ReadingStatus } from '@reading-room/common';

import { buildApp } from '../../app.js';
import { aBook } from '../../testing/builders/book.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';

export type UpdateBookDriver = {
    given: {
        book: (status?: ReadingStatus) => Promise<void>;
    };
    patch: {
        book: (overrides?: { status?: ReadingStatus; rating?: number; updatedAt?: string }) => Promise<Response>;
        withStaleToken: () => Promise<Response>;
        withId: (id: string, body: Record<string, unknown>) => Promise<Response>;
    };
    assert: {
        updated: (res: Response, expected: Partial<Book>) => void;
        badRequest: (res: Response) => void;
        notFound: (res: Response) => void;
        conflict: (res: Response) => void;
        ruleViolation: (res: Response) => void;
    };
};

export const makeUpdateBookDriver = (): UpdateBookDriver => {
    const store = new FakeStore();
    const app = buildApp({ store, logger: makeFakeLogger() });
    let lastBook: Book | undefined;

    const book = (): Book => {
        if (lastBook === undefined) throw new Error('driver: call given.book() first');

        return lastBook;
    };

    return {
        given: {
            book: async (status = ReadingStatus.WantToRead) => {
                lastBook = await store.books.insert(aBook({ status }).buildDTO());
            },
        },

        patch: {
            book: (overrides = {}) => {
                const body: Record<string, unknown> = {
                    updatedAt: overrides.updatedAt ?? book().updatedAt.toISOString(),
                };
                if (overrides.status !== undefined) body['status'] = overrides.status;
                if (overrides.rating !== undefined) body['rating'] = overrides.rating;

                return request(app).patch(`/api/books/${book().id}`).send(body);
            },

            withStaleToken: () =>
                request(app)
                    .patch(`/api/books/${book().id}`)
                    .send({ updatedAt: new Date(0).toISOString(), status: ReadingStatus.Reading }),

            withId: (id, body) => request(app).patch(`/api/books/${id}`).send(body),
        },

        assert: {
            updated: (res, expected) => {
                expect(res.status).toBe(200);
                Object.entries(expected).forEach(([key, val]) => {
                    expect(res.body[key]).toBe(val);
                });
            },

            badRequest: (res) => {
                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty('error');
            },

            notFound: (res) => {
                expect(res.status).toBe(404);
                expect(res.body).toHaveProperty('error');
            },

            conflict: (res) => {
                expect(res.status).toBe(409);
                expect(res.body).toHaveProperty('error');
            },

            ruleViolation: (res) => {
                expect(res.status).toBe(422);
                expect(res.body).toHaveProperty('error');
            },
        },
    };
};
