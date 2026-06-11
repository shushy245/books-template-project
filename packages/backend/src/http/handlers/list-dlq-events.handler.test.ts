import { beforeEach, describe, it } from 'vitest';

import { ListDlqEventsHandlerDriver, makeListDlqEventsHandlerDriver } from './list-dlq-events.handler.driver.ts';

describe('GET /api/admin/dlq', () => {
    let driver: ListDlqEventsHandlerDriver;

    beforeEach(() => {
        driver = makeListDlqEventsHandlerDriver();
    });

    it('returns an empty array when no events are dead-lettered', async () => {
        const res = await driver.get.dlq();

        driver.assert.ok(res, 0);
    });

    it('returns all dead-lettered events', async () => {
        await driver.given.dlqEntry('outbox-1');
        await driver.given.dlqEntry('outbox-2');

        const res = await driver.get.dlq();

        driver.assert.ok(res, 2);
    });
});
