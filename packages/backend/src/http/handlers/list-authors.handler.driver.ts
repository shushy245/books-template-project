import { expect } from 'vitest';
import request from 'supertest';
import { randomUUID } from 'crypto';
import type { Response } from 'supertest';
import { Author } from '@reading-room/common';

import { buildApp } from '../../app.ts';
import { anAuthor } from '../../testing/builders';
import { FakeStore } from '../../testing/fake-store.ts';
import { makeFakeLogger } from '../../testing/fake-logger.ts';

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
                store.authors.seed(anAuthor({ id: randomUUID() }).withName(name).build());
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
