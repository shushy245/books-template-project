import { expect } from 'vitest';
import type { Response } from 'supertest';
import request from 'supertest';

import { Author } from '@reading-room/common';

import { buildApp } from '../../app.js';
import { anAuthorWithRandomId } from '../../testing/builders/author.js';
import { FakeStore } from '../../testing/fake-store.js';
import { makeFakeLogger } from '../../testing/fake-logger.js';

export type ListAuthorsDriver = {
    given: {
        author: (name: string) => Promise<void>;
    };
    get: {
        authors: () => Promise<Response>;
    };
    assert: {
        names: (res: Response, names: string[]) => void;
    };
};

export const makeListAuthorsDriver = (): ListAuthorsDriver => {
    const store = new FakeStore();
    const app = buildApp({ store, logger: makeFakeLogger() });

    return {
        given: {
            author: async (name) => {
                store.authors.seed(anAuthorWithRandomId().withName(name).build());
            },
        },

        get: {
            authors: () => request(app).get('/api/authors'),
        },

        assert: {
            names: (res, names) => {
                expect(res.status).toBe(200);
                const actual: string[] = res.body.map((a: Author): string => a.name);
                expect(actual.sort()).toEqual([...names].sort());
            },
        },
    };
};
