import { BookListTestIds } from '../../../src/features/books/book-list.test-ids.ts';

export class BookListDriver {
    given = {
        clear: (): void => {
            cy.task('clearBooks');
        },
        visit: (): void => {
            cy.visit('/');
        },
        books: (titles: string[]): void => {
            cy.task('seedBooks', { titles });
        },
    };

    select = {
        sortBy: (value: string): void => {
            cy.findByTestId(BookListTestIds.SortBySelect).select(value);
        },
        sortDir: (value: string): void => {
            cy.findByTestId(BookListTestIds.SortDirSelect).select(value);
        },
    };

    click = {
        nextPage: (): void => {
            cy.findByTestId(BookListTestIds.NextPage).click();
        },
    };

    assert = {
        cardCount: (count: number): void => {
            cy.findAllByTestId(/^BookListTestIds\.Card\./).should('have.length', count);
        },
        cardTitleAt: (index: number, title: string): void => {
            cy.findAllByTestId(/^BookListTestIds\.Card\./)
                .eq(index)
                .should('contain.text', title);
        },
        currentPage: (page: number): void => {
            cy.contains(`${page} /`).should('be.visible');
        },
    };
}
