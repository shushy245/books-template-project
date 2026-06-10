import { expect } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'crypto';
import type { Response } from 'supertest';
import { CreateBookDto } from '@reading-room/common';

import { buildApp } from '../../app.ts';
import { FakeStore } from '../../testing/fake-store.ts';
import { makeFakeLogger } from '../../testing/fake-logger.ts';
import { aBook, aShelf, anAuthor } from '../../testing/builders';

export type CreateBookDriver = {
    given: {
        shelf: () => void;
        author: () => void;
    };
    post: {
        book: (overrides?: Record<string, unknown>) => Promise<Response>;
    };
    assert: {
        created: (res: Response, title: string) => void;
        badRequest: (res: Response) => void;
        notFound: (res: Response) => void;
    };
};

export const makeCreateBookDriver = (): CreateBookDriver => {
    const store = new FakeStore();
    const app = buildApp({ store, logger: makeFakeLogger() });
    const shelfId = randomUUID();
    const authorId = randomUUID();

    const validBody = (): CreateBookDto => aBook({ title: 'Dune', authorId, shelfId }).buildDTO();

    return {
        given: {
            shelf: () => {
                store.shelves.seed(aShelf({ id: shelfId }).build());
            },
            author: () => {
                store.authors.seed(anAuthor({ id: authorId }).build());
            },
        },

        post: {
            book: (overrides = {}) =>
                request(app)
                    .post('/api/books')
                    .send({ ...validBody(), ...overrides }),
        },

        assert: {
            created: (res, title) => {
                expect(res.status).toBe(201);
                expect(res.body.id).toBeDefined();
                expect(res.body.title).toBe(title);
            },

            badRequest: (res) => {
                expect(res.status).toBe(400);
                expect(res.body).toHaveProperty('error');
            },

            notFound: (res) => {
                expect(res.status).toBe(404);
                expect(res.body).toHaveProperty('error');
            },
        },
    };
};
