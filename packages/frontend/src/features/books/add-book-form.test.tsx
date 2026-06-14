import { beforeEach, describe, it, vi } from 'vitest';

import { AddBookFormDriver, makeAddBookFormDriver } from './add-book-form.driver.tsx';

vi.mock('../../api/books.api.ts');
vi.mock('../../data/use-authors.ts');
vi.mock('../../data/use-shelves.ts');

const anAuthor = (id: string, name: string) => ({
    id,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
});

const aShelf = (id: string, name: string) => ({
    id,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
});

describe('AddBookForm', () => {
    let driver: AddBookFormDriver;

    beforeEach(() => {
        driver = makeAddBookFormDriver();
        driver.given.fetchBooksResolves();
        driver.given.authors([anAuthor('author-1', 'Frank Herbert')]);
        driver.given.shelves([aShelf('shelf-1', 'Sci-Fi')]);
    });

    it('submit button is disabled when title is empty', async () => {
        await driver.when.created();

        driver.assert.submitDisabled();
    });

    it('submit button is disabled when no author is selected', async () => {
        await driver.when.created();

        await driver.type.title('Dune');

        driver.assert.submitDisabled();
    });

    it('submit button is disabled when no shelf is selected', async () => {
        await driver.when.created();

        await driver.type.title('Dune');
        await driver.select.author('author-1');

        driver.assert.submitDisabled();
    });

    it('submit button is enabled when title, author, and shelf are all filled', async () => {
        await driver.when.created();

        await driver.type.title('Dune');
        await driver.select.author('author-1');
        await driver.select.shelf('shelf-1');

        driver.assert.submitEnabled();
    });

    it('successful submit resets the form', async () => {
        driver.given.createBookResolves();
        await driver.when.created();

        await driver.type.title('Dune');
        await driver.select.author('author-1');
        await driver.select.shelf('shelf-1');
        await driver.click.submit();

        await driver.assert.formResetEventually();
    });

    it('API rejection shows the error message', async () => {
        driver.given.createBookRejectsWith();
        await driver.when.created();

        await driver.type.title('Dune');
        await driver.select.author('author-1');
        await driver.select.shelf('shelf-1');

        driver.assert.errorAbsent();
        await driver.click.submit();

        await driver.assert.errorVisible();
    });

    it('double-submit is prevented: button is disabled while submitting', async () => {
        driver.given.createBookNeverResolves();
        await driver.when.created();

        await driver.type.title('Dune');
        await driver.select.author('author-1');
        await driver.select.shelf('shelf-1');
        await driver.click.submit();

        driver.assert.submitDisabled();
    });
});
