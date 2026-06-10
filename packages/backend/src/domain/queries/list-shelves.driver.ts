import { expect } from 'vitest';
import { randomUUID } from 'crypto';
import { Shelf } from '@reading-room/common';

import { aShelf } from '../../testing/builders';
import { listShelves } from './list-shelves.ts';
import { FakeShelfRepository } from '../../testing/fake-shelf.repository.ts';

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
