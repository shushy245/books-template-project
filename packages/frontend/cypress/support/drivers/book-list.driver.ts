import { BookListTestIds } from '../../../src/features/books/book-list.test-ids.ts';

export class BookListDriver {
    visit(): void {
        cy.visit('/');
    }

    seedBooks(titles: string[]): void {
        cy.task('seedBooks', { titles });
    }

    clearBooks(): void {
        cy.task('clearBooks');
    }

    assertCardCount(count: number): void {
        cy.findAllByTestId(/^BookListTestIds\.Card\./).should('have.length', count);
    }

    assertCardTitleAt(index: number, title: string): void {
        cy.findAllByTestId(/^BookListTestIds\.Card\./)
            .eq(index)
            .should('contain.text', title);
    }

    selectSortBy(value: string): void {
        cy.findByTestId(BookListTestIds.SortBySelect).select(value);
    }

    selectSortDir(value: string): void {
        cy.findByTestId(BookListTestIds.SortDirSelect).select(value);
    }

    clickNextPage(): void {
        cy.findByTestId(BookListTestIds.NextPage).click();
    }

    assertCurrentPage(page: number): void {
        cy.contains(`${page} /`).should('be.visible');
    }
}
