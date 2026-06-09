import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, waitFor } from '@testing-library/react';

import { ReadingStatus } from '@reading-room/common';

import * as booksApi from '../../api/books.api.ts';
import { BookCardDriver, makeBookCardDriver } from './book-card.driver.tsx';

vi.mock('../../api/books.api.ts');

describe('BookCard', () => {
    let driver: BookCardDriver;

    beforeEach(() => {
        driver = makeBookCardDriver();
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders the book title', () => {
        driver.given.render({ title: 'Dune' });

        driver.assert.title('Dune');
    });

    it('clicking delete calls onDelete with the book id', async () => {
        const { book, onDelete } = driver.given.render({ id: 'book-42' });

        await driver.click.delete(book.id);

        driver.assert.onDeleteCalledWith(onDelete, 'book-42');
    });

    it('status change updates the select immediately before patchBook resolves', async () => {
        let resolvePatch!: (value: unknown) => void;
        vi.spyOn(booksApi, 'patchBook').mockReturnValue(new Promise((res) => { resolvePatch = res; }));

        const { book } = driver.given.render({ status: ReadingStatus.WantToRead });

        // userEvent runs the handler up to the first await (the patchBook call), then flushes
        // React state — so the optimistic setLocalBook is committed before this line returns.
        await driver.select.status(book.id, ReadingStatus.Reading);

        driver.assert.status(book.id, ReadingStatus.Reading);

        await act(async () => {
            resolvePatch({ ...book, status: ReadingStatus.Reading, updatedAt: new Date() });
        });
    });

    it('status change success: select reflects the value returned from patchBook', async () => {
        const { book } = driver.given.render({ status: ReadingStatus.WantToRead });
        vi.spyOn(booksApi, 'patchBook').mockResolvedValue({ ...book, status: ReadingStatus.Reading, updatedAt: new Date() });

        await driver.select.status(book.id, ReadingStatus.Reading);

        await waitFor(() => driver.assert.status(book.id, ReadingStatus.Reading));
    });

    it('status change rollback: select reverts to original status when patchBook rejects', async () => {
        const { book } = driver.given.render({ status: ReadingStatus.WantToRead });
        vi.spyOn(booksApi, 'patchBook').mockRejectedValue(new Error('network error'));

        await driver.select.status(book.id, ReadingStatus.Reading);

        await waitFor(() => driver.assert.status(book.id, ReadingStatus.WantToRead));
    });
});
