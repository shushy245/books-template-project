import { beforeEach, describe, expect, it } from 'vitest';

import { BookSortField, PaginatedResult, Book, ReadingStatus, SortDirection } from '@reading-room/common';

import { aBook } from '../../testing/builders/book.js';
import { FakeBookRepository } from '../../testing/fake-book-repository.js';
import { listBooks } from './list-books.js';

type ListBooksDriver = {
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

const makeListBooksDriver = (): ListBooksDriver => {
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

describe('listBooks', () => {
    let driver: ListBooksDriver;

    beforeEach(() => {
        driver = makeListBooksDriver();
    });

    it('returns books newest-first by default', async () => {
        await driver.given.book('First');
        await driver.given.book('Second');

        const result = await driver.get.list();

        driver.assert.titlesInOrder(result, ['Second', 'First']);
    });

    it('filters by shelf — only returns books on that shelf', async () => {
        await driver.given.book('On Shelf A', 'shelf-a');
        await driver.given.book('On Shelf B', 'shelf-b');

        const result = await driver.get.list({ shelfId: 'shelf-a' });

        driver.assert.titlesInOrder(result, ['On Shelf A']);
        driver.assert.total(result, 1);
    });

    it('page 2 returns the next slice', async () => {
        await driver.given.book('A');
        await driver.given.book('B');
        await driver.given.book('C');

        const result = await driver.get.list({
            sortBy: BookSortField.Title,
            sortDir: SortDirection.Asc,
            page: 2,
            pageSize: 2,
        });

        driver.assert.titlesInOrder(result, ['C']);
        driver.assert.total(result, 3);
        driver.assert.page(result, 2);
    });
});
