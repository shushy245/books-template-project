// AppDriver: test driver for the top-level app shell.
// Tests contain no logic — all DOM interaction lives here.
// Written before the component (outside-in TDD).
export class AppDriver {
  visit(): void {
    cy.visit('/');
  }

  getHeading(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.findByTestId('AppTestIds.Heading');
  }

  getBackendBadge(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.findByTestId('AppTestIds.BackendBadge');
  }
}
