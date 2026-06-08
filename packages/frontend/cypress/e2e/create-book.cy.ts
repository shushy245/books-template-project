import { BookListDriver } from '../support/drivers/book-list.driver.js';
import { AddBookFormDriver } from '../support/drivers/add-book-form.driver.js';

describe('Add a book', () => {
    const driver = new AddBookFormDriver();
    const list = new BookListDriver();

    beforeEach(() => {
        driver.given.clear();
        driver.given.author('Frank Herbert');
        driver.given.shelf('Sci-Fi');
        driver.given.visit();
    });

    it('creates a book and shows it in the list', () => {
        driver.type.title('Dune');
        driver.select.author('Frank Herbert');
        driver.select.shelf('Sci-Fi');
        driver.select.status('Want to read');
        driver.click.submit();

        list.assertCardCount(1);
        list.assertCardTitleAt(0, 'Dune');
    });

    it('keeps the submit button disabled until title, author and shelf are chosen', () => {
        driver.type.title('Dune');

        driver.assert.submitDisabled();
    });
});
