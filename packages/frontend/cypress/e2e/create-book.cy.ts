import { AddBookFormDriver } from '../support/drivers/add-book-form.driver.js';

describe('Add a book', () => {
    const driver = new AddBookFormDriver();

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

        driver.assert.cardVisible('Dune');
        driver.assert.cardCount(1);
    });

    it('keeps the submit button disabled until title, author and shelf are chosen', () => {
        driver.type.title('Dune');

        driver.assert.submitDisabled();
    });
});
