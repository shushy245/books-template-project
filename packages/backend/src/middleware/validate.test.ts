import { describe, it } from 'vitest';

import { ValidateDriver, makeValidateDriver } from './validate.driver.ts';

// Learning tests — verify Zod and the middleware behave as expected at our integration points.
// These exist to catch silent breakage on library upgrades.

describe('validateBody', () => {
    const driver: ValidateDriver = makeValidateDriver();

    it('returns 200 with parsed body on valid input', async () => {
        const res = await driver.post.body({ name: 'Alice', age: 30 });

        driver.assert.success(res, { name: 'Alice', age: 30 });
    });

    it('returns 400 on invalid input', async () => {
        const res = await driver.post.body({ name: '', age: 'not-a-number' });

        driver.assert.badRequest(res);
    });

    it('strips unknown fields from the parsed body', async () => {
        const res = await driver.post.body({ name: 'Bob', age: 25, extra: 'stripped' });

        driver.assert.success(res, { name: 'Bob', age: 25 });
        driver.assert.fieldAbsent(res, 'extra');
    });

    it('returns 400 on missing required fields', async () => {
        const res = await driver.post.body({ name: 'Alice' });

        driver.assert.badRequest(res);
    });
});
