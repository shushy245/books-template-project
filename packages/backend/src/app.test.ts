import { beforeEach, describe, it } from 'vitest';

import { HealthDriver, makeHealthDriver } from './app.driver.js';

describe('GET /health', () => {
    let driver: HealthDriver;

    beforeEach(() => {
        driver = makeHealthDriver();
    });

    it('returns 200 with status ok', async () => {
        const response = await driver.get.health();

        driver.assert.healthOk(response);
    });

    it('logs a handler-entry message', async () => {
        await driver.get.health();

        driver.assert.healthLogged();
    });
});
