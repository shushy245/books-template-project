import { beforeEach, describe, it } from 'vitest';

import { ListDlqEventsDriver, makeListDlqEventsDriver } from './list-dlq-events.driver.ts';

describe('listDlqEvents', () => {
    let driver: ListDlqEventsDriver;

    beforeEach(() => {
        driver = makeListDlqEventsDriver();
    });

    it('returns an empty list when no events are dead-lettered', async () => {
        const result = await driver.get.list();

        driver.assert.count(result, 0);
    });

    it('returns all dead-lettered events', async () => {
        await driver.given.dlqEntry('outbox-1', 'book-1');
        await driver.given.dlqEntry('outbox-2', 'book-2');

        const result = await driver.get.list();

        driver.assert.count(result, 2);
        driver.assert.outboxIds(result, ['outbox-1', 'outbox-2']);
    });
});
