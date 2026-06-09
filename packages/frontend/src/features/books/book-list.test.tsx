import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';

import { ReadingStatus } from '@reading-room/common';

import * as booksApi from '../../api/books.api.ts';
import { BookListDriver, makeBookListDriver } from './book-list.driver.tsx';

vi.mock('../../api/books.api.ts');

describe('BookList', () => {
    let driver: BookListDriver;

    beforeEach(() => {
        vi.mocked(booksApi.deleteBook).mockResolvedValue(undefined);
        driver = makeBookListDriver();
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('shows the empty-state message when the result has no items', async () => {
        driver.given.noBooks();

        await driver.given.render();

        driver.assert.emptyState();
    });

    it('renders one card per book in the result', async () => {
        driver.given.books([
            { id: 'a', title: 'Dune', authorId: 'au', shelfId: 'sh', status: ReadingStatus.WantToRead, createdAt: new Date(), updatedAt: new Date() },
            { id: 'b', title: 'Foundation', authorId: 'au', shelfId: 'sh', status: ReadingStatus.Reading, createdAt: new Date(), updatedAt: new Date() },
        ]);

        await driver.given.render();

        driver.assert.cardCount(2);
    });

    it('Prev button is disabled on page 1', async () => {
        driver.given.books(
            [{ id: 'a', title: 'Dune', authorId: 'au', shelfId: 'sh', status: ReadingStatus.WantToRead, createdAt: new Date(), updatedAt: new Date() }],
            1,
        );

        await driver.given.render();

        driver.assert.prevDisabled();
    });

    it('Next button is disabled when total fits in a single page', async () => {
        driver.given.books(
            [{ id: 'a', title: 'Dune', authorId: 'au', shelfId: 'sh', status: ReadingStatus.WantToRead, createdAt: new Date(), updatedAt: new Date() }],
            1,
        );

        await driver.given.render();

        driver.assert.nextDisabled();
    });

    it('Next button is enabled when there are more pages', async () => {
        driver.given.books(
            [{ id: 'a', title: 'Dune', authorId: 'au', shelfId: 'sh', status: ReadingStatus.WantToRead, createdAt: new Date(), updatedAt: new Date() }],
            100,
        );

        await driver.given.render();

        driver.assert.nextEnabled();
    });

    it('triggerRefresh causes fetchBooks to be called a second time', async () => {
        driver.given.noBooks();

        await driver.given.render();

        await driver.click.triggerRefresh();

        await waitFor(() => driver.assert.fetchCallCount(2));
    });
});
