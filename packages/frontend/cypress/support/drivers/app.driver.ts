// AppDriver: test driver for the top-level app shell.
// Tests contain no logic — all DOM interaction and assertions live here.
// Written before the component (outside-in TDD).
export class AppDriver {
    visit(): void {
        cy.visit('/');
    }

    assertHeadingVisible(): void {
        cy.findByTestId('AppTestIds.Heading').should('be.visible');
    }

    assertBackendOk(): void {
        cy.findByTestId('AppTestIds.BackendBadge').should('contain.text', 'backend: ok');
    }
}
