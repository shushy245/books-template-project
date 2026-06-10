import { expect } from 'vitest';
import { Book, PaginatedResult, ReadingStatus } from '@reading-room/common';

import { aBook } from '../../testing/builders';
import { FakeBookRepository } from '../../testing/fake-book-repository.ts';
import { listBooks } from './list-books.ts';

export type ListBooksDriver = {
    given: {
        book: (title: string, shelfId?: string, status?: ReadingStatus) => Promise<void>;
    };
    get: {
        list: (query?: Parameters<typeof listBooks>[1]) => Promise<PaginatedResult<Book>>;
    };
    assert: {
        titlesInOrder: (result: PaginatedResult<Book>, titles: string[]) => void;
        total: (result: PaginatedResult<Book>, total: number) => void;
        page: (result: PaginatedResult<Book>, page: number) => void;
    };
};

export const makeListBooksDriver = (): ListBooksDriver => {
    const repo = new FakeBookRepository();

    return {
        given: {
            book: async (title, shelfId = 'shelf-1', status = ReadingStatus.WantToRead) => {
                await repo.insert(aBook({ title, shelfId, status }).buildDTO());
            },
        },

        get: {
            list: (query = {}) => listBooks({ bookRepo: repo }, query),
        },

        assert: {
            titlesInOrder: (result, titles) => {
                expect(result.items.map((b) => b.title)).toEqual(titles);
            },

            total: (result, total) => {
                expect(result.total).toBe(total);
            },

            page: (result, page) => {
                expect(result.page).toBe(page);
            },
        },
    };
};
