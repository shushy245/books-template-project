import { expect } from 'vitest';
import { Shelf } from '@reading-room/common';

import { aShelfWithRandomId } from '../../testing/builders/shelf.js';
import { FakeShelfRepository } from '../../testing/fake-shelf.repository.js';
import { listShelves } from './list-shelves.js';

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
                repo.seed(aShelfWithRandomId().withName(name).build());
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
