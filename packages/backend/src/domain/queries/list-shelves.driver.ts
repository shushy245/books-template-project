import { randomUUID } from 'crypto';

import { expect } from 'vitest';
import { Shelf } from '@reading-room/common';

import { aShelf } from '../../testing/builders';
import { FakeShelfRepository } from '../../testing/fake-shelf.repository.ts';
import { listShelves } from './list-shelves.ts';

export type ListShelvesDriver = {
    given: {
        shelf: (name: string) => Promise<void>;
    };
    get: {
        list: () => Promise<Shelf[]>;
    };
    assert: {
        names: (result: Shelf[], names: string[]) => void;
    };
};

export const makeListShelvesDriver = (): ListShelvesDriver => {
    const repo = new FakeShelfRepository();

    return {
        given: {
            shelf: async (name) => {
                repo.seed(aShelf({ id: randomUUID() }).withName(name).build());
            },
        },

        get: {
            list: () => listShelves({ shelfRepo: repo }),
        },

        assert: {
            names: (result, names) => {
                expect(result.map((s) => s.name).sort()).toEqual([...names].sort());
            },
        },
    };
};
