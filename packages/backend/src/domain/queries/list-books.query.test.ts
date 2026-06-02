import { beforeEach, describe, expect, it } from 'vitest';

import { BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

import { FakeBookRepository } from '../../testing/fake-book-repository.js';
import { listBooks } from './list-books.query.js';

type ListBooksDriver = {
    seedBook: (title: string, shelfId?: string, status?: ReadingStatus) => Promise<void>;
    list: (query?: Parameters<typeof listBooks>[1]) => ReturnType<typeof listBooks>;
    assertTitlesInOrder: (result: Awaited<ReturnType<typeof listBooks>>, titles: string[]) => void;
    assertTotal: (result: Awaited<ReturnType<typeof listBooks>>, total: number) => void;
    assertPage: (result: Awaited<ReturnType<typeof listBooks>>, page: number) => void;
};

const makeListBooksDriver = (): ListBooksDriver => {
    const repo = new FakeBookRepository();

    const seedBook = async (title: string, shelfId = 'shelf-1', status = ReadingStatus.WantToRead): Promise<void> => {
        await repo.insert({ title, authorId: 'author-1', shelfId, status });
    };

    const list = (query: Parameters<typeof listBooks>[1] = {}) => listBooks({ bookRepo: repo }, query);

    return {
        seedBook,
        list,
        assertTitlesInOrder: (result, titles) => {
            expect(result.items.map((b) => b.title)).toEqual(titles);
        },
        assertTotal: (result, total) => {
            expect(result.total).toBe(total);
        },
        assertPage: (result, page) => {
            expect(result.page).toBe(page);
        },
    };
};

describe('listBooks', () => {
    let driver: ListBooksDriver;

    beforeEach(() => {
        driver = makeListBooksDriver();
    });

    it('returns books newest-first by default', async () => {
        await driver.seedBook('First');
        await driver.seedBook('Second');

        const result = await driver.list();

        driver.assertTitlesInOrder(result, ['Second', 'First']);
    });

    it('filters by shelf — only returns books on that shelf', async () => {
        await driver.seedBook('On Shelf A', 'shelf-a');
        await driver.seedBook('On Shelf B', 'shelf-b');

        const result = await driver.list({ shelfId: 'shelf-a' });

        driver.assertTitlesInOrder(result, ['On Shelf A']);
        driver.assertTotal(result, 1);
    });

    it('page 2 returns the next slice', async () => {
        await driver.seedBook('A');
        await driver.seedBook('B');
        await driver.seedBook('C');

        const result = await driver.list({
            sortBy: BookSortField.Title,
            sortDir: SortDirection.Asc,
            page: 2,
            pageSize: 2,
        });

        driver.assertTitlesInOrder(result, ['C']);
        driver.assertTotal(result, 3);
        driver.assertPage(result, 2);
    });
});
