import { beforeEach, describe, it, vi } from 'vitest';

import { ReadingStatus } from '@reading-room/common';

import { aBook } from '../../testing/builders/index.ts';
import { BookListDriver, makeBookListDriver } from './book-list.driver.tsx';

vi.mock('../../api/books.api.ts');

describe('BookList', () => {
    let driver: BookListDriver;

    beforeEach(() => {
        driver = makeBookListDriver();
        driver.given.deleteBookResolves();
    });

    it('shows the empty-state message when the result has no items', async () => {
        driver.given.noBooks();

        await driver.when.created();

        driver.assert.emptyState();
    });

    it('renders one card per book in the result', async () => {
        driver.given.books([
            aBook({ id: 'a', title: 'Dune' }).build(),
            aBook({ id: 'b', title: 'Foundation', status: ReadingStatus.Reading }).build(),
        ]);

        await driver.when.created();

        driver.assert.cardCount(2);
    });

    it('Prev button is disabled on page 1', async () => {
        driver.given.books([aBook().build()], 1);

        await driver.when.created();

        driver.assert.prevDisabled();
    });

    it('Next button is disabled when total fits in a single page', async () => {
        driver.given.books([aBook().build()], 1);

        await driver.when.created();

        driver.assert.nextDisabled();
    });

    it('Next button is enabled when there are more pages', async () => {
        driver.given.books([aBook().build()], 100);

        await driver.when.created();

        driver.assert.nextEnabled();
    });

    it('triggerRefresh causes fetchBooks to be called a second time', async () => {
        driver.given.noBooks();

        await driver.when.created();

        await driver.click.triggerRefresh();

        await driver.assert.fetchCallCountEventually(2);
    });
});
