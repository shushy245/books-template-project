import type { Response } from 'supertest';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { Book, ReadingStatus } from '@reading-room/common';

import { buildApp } from '../../app.js';
import { aBook } from '../../testing/builders/book.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';

type UpdateBookDriver = {
    given: {
        book: (status?: ReadingStatus) => Promise<void>;
    };
    patch: {
        book: (overrides?: { status?: ReadingStatus; rating?: number; updatedAt?: string }) => Promise<Response>;
        withStaleToken: () => Promise<Response>;
    };
    assert: {
        updated: (res: Response, expected: Partial<Book>) => void;
        badRequest: (res: Response) => void;
        notFound: (res: Response) => void;
        conflict: (res: Response) => void;
        ruleViolation: (res: Response) => void;
    };
};

const makeUpdateBookDriver = (): UpdateBookDriver => {
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

describe('PATCH /api/books/:id', () => {
    let driver: UpdateBookDriver;

    beforeEach(() => {
        driver = makeUpdateBookDriver();
    });

    it('updates and returns the book on a valid status transition', async () => {
        await driver.given.book(ReadingStatus.WantToRead);

        const res = await driver.patch.book({ status: ReadingStatus.Reading });

        driver.assert.updated(res, { status: ReadingStatus.Reading });
    });

    it('updates the rating when the book is in Read status', async () => {
        await driver.given.book(ReadingStatus.Read);

        const res = await driver.patch.book({ rating: 5 });

        driver.assert.updated(res, { rating: 5 });
    });

    it('returns 400 when updatedAt is missing from the body', async () => {
        await driver.given.book();

        const res = await request(buildApp({ store: new FakeStore(), logger: makeFakeLogger() }))
            .patch('/api/books/00000000-0000-0000-0000-000000000000')
            .send({ status: ReadingStatus.Reading });

        driver.assert.badRequest(res);
    });

    it('returns 400 when the id is not a valid uuid', async () => {
        const res = await request(buildApp({ store: new FakeStore(), logger: makeFakeLogger() }))
            .patch('/api/books/not-a-uuid')
            .send({ updatedAt: new Date().toISOString() });

        driver.assert.badRequest(res);
    });

    it('returns 409 on a stale optimistic lock token', async () => {
        await driver.given.book();

        const res = await driver.patch.withStaleToken();

        driver.assert.conflict(res);
    });

    it('returns 422 on an invalid status transition', async () => {
        await driver.given.book(ReadingStatus.WantToRead);

        const res = await driver.patch.book({ status: ReadingStatus.Read });

        driver.assert.ruleViolation(res);
    });
});
