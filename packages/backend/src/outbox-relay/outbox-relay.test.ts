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

    it('logs a processing entry containing the event type for each processed event', async () => {
        await driver.given.unprocessedEvent(OutboxEventType.BookCreated);

        await driver.when.poll();

        driver.assert.loggedProcessed(OutboxEventType.BookCreated);
    });

    it('continues processing subsequent records when one record fails to mark processed', async () => {
        const failingId = await driver.given.unprocessedEvent(OutboxEventType.BookCreated);
        await driver.given.unprocessedEvent(OutboxEventType.BookUpdated);

        driver.given.failingMarkProcessedFor(failingId);

        await driver.when.poll();

        driver.assert.loggedError(failingId);
        await driver.assert.unprocessedCount(1);
    });
});
