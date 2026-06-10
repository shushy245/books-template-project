import { randomUUID } from 'crypto';

import { expect } from 'vitest';
import type { Response } from 'supertest';
import request from 'supertest';

import { Shelf } from '@reading-room/common';

import { aShelf } from '../../testing/builders';
import { buildApp } from '../../app.ts';
import { FakeStore } from '../../testing/fake-store.ts';
import { makeFakeLogger } from '../../testing/fake-logger.ts';

export type ListShelvesDriver = {
    given: {
        shelf: (name: string) => Promise<void>;
    };
    get: {
        shelves: () => Promise<Response>;
    };
    assert: {
        names: (res: Response, names: string[]) => void;
    };
};

export const makeListShelvesDriver = (): ListShelvesDriver => {
    const store = new FakeStore();
    const app = buildApp({ store, logger: makeFakeLogger() });

    return {
        given: {
            shelf: async (name) => {
                store.shelves.seed(aShelf({ id: randomUUID() }).withName(name).build());
            },
        },

        get: {
            shelves: () => request(app).get('/api/shelves'),
        },

        assert: {
            names: (res, names) => {
                expect(res.status).toBe(200);
                const actual: string[] = res.body.map((s: Shelf): string => s.name);
                expect(actual.sort()).toEqual([...names].sort());
            },
        },
    };
};
