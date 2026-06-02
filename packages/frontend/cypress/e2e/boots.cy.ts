import { AppDriver } from '../support/drivers/app.driver';

describe('App shell', () => {
    const driver = new AppDriver();

    beforeEach(() => {
        driver.visit();
    });

    it('shows the Reading Room heading', () => {
        driver.assertHeadingVisible();
    });

    it('shows the backend: ok badge once the health check resolves', () => {
        driver.assertBackendOk();
    });
});
