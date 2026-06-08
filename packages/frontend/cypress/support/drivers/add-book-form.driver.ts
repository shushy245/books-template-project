import { AddBookFormTestIds } from '../../../src/features/books/add-book-form.test-ids.js';

export class AddBookFormDriver {
    given = {
        clear: (): void => {
            cy.task('clearBooks');
        },
        author: (name: string): void => {
            cy.task('seedAuthor', { name });
        },
        shelf: (name: string): void => {
            cy.task('seedShelf', { name });
        },
        visit: (): void => {
            cy.visit('/');
        },
    };

    type = {
        title: (title: string): void => {
            cy.findByTestId(AddBookFormTestIds.TitleInput).clear().type(title);
        },
    };

    select = {
        author: (name: string): void => {
            cy.findByTestId(AddBookFormTestIds.AuthorSelect).select(name);
        },
        shelf: (name: string): void => {
            cy.findByTestId(AddBookFormTestIds.ShelfSelect).select(name);
        },
        status: (label: string): void => {
            cy.findByTestId(AddBookFormTestIds.StatusSelect).select(label);
        },
    };

    click = {
        submit: (): void => {
            cy.findByTestId(AddBookFormTestIds.SubmitButton).click();
        },
    };

    assert = {
        cardVisible: (title: string): void => {
            cy.findAllByTestId(/^BookListTestIds\.Card\./).should('contain.text', title);
        },
        cardCount: (count: number): void => {
            cy.findAllByTestId(/^BookListTestIds\.Card\./).should('have.length', count);
        },
        submitDisabled: (): void => {
            cy.findByTestId(AddBookFormTestIds.SubmitButton).should('be.disabled');
        },
    };
}
