import { randomUUID } from 'crypto';

import { expect } from 'vitest';
import { Author } from '@reading-room/common';

import { anAuthor } from '../../testing/builders';
import { FakeAuthorRepository } from '../../testing/fake-author.repository.ts';
import { listAuthors } from './list-authors.ts';

export type ListAuthorsDriver = {
    given: {
        author: (name: string) => Promise<void>;
    };
    get: {
        list: () => Promise<Author[]>;
    };
    assert: {
        names: (result: Author[], names: string[]) => void;
    };
};

export const makeListAuthorsDriver = (): ListAuthorsDriver => {
    const repo = new FakeAuthorRepository();

    return {
        given: {
            author: async (name) => {
                repo.seed(anAuthor({ id: randomUUID() }).withName(name).build());
            },
        },

        get: {
            list: () => listAuthors({ authorRepo: repo }),
        },

        assert: {
            names: (result, names) => {
                expect(result.map((a) => a.name).sort()).toEqual([...names].sort());
            },
        },
    };
};
