import { beforeEach, describe, it } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { OutboxRelayDriver, makeOutboxRelayDriver } from './outbox-relay.driver.js';

describe('pollOutbox', () => {
    let driver: OutboxRelayDriver;

    beforeEach(() => {
        driver = makeOutboxRelayDriver();
    });

    it('marks an unprocessed event as processed after a poll', async () => {
        await driver.given.unprocessedEvent(OutboxEventType.BookCreated);

        await driver.when.poll();

        await driver.assert.noUnprocessedEvents();
    });

    it('processes multiple unprocessed events in a single poll', async () => {
        await driver.given.unprocessedEvent(OutboxEventType.BookCreated);
        await driver.given.unprocessedEvent(OutboxEventType.BookUpdated);
        await driver.given.unprocessedEvent(OutboxEventType.BookDeleted);

        await driver.when.poll();

        await driver.assert.noUnprocessedEvents();
    });

    it('does not re-process events that were already marked processed', async () => {
        await driver.given.unprocessedEvent(OutboxEventType.BookCreated);

        await driver.when.poll();
        await driver.when.poll();

        await driver.assert.noUnprocessedEvents();
    });

    it('leaves unprocessed events untouched when there are none to process', async () => {
        await driver.when.poll();

        await driver.assert.noUnprocessedEvents();
    });

    it('logs a dispatch entry for each event type processed', async () => {
        await driver.given.unprocessedEvent(OutboxEventType.BookCreated);

        await driver.when.poll();

        driver.assert.loggedDispatch(OutboxEventType.BookCreated);
    });
});
