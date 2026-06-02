import { AppDriver } from '../support/drivers/app.driver';

describe('App shell', () => {
  const driver = new AppDriver();

  beforeEach(() => {
    driver.visit();
  });

  it('shows the Reading Room heading', () => {
    driver.getHeading().should('be.visible');
  });

  it('shows the backend: ok badge once the health check resolves', () => {
    driver.getBackendBadge().should('contain.text', 'backend: ok');
  });
});
