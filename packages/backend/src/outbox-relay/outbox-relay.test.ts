import { beforeEach, describe, it } from 'vitest';

import { OutboxEventType } from '@reading-room/common';

import { OutboxRelayDriver, makeOutboxRelayDriver } from './outbox-relay.driver.ts';

describe('pollOutbox', () => {
    let driver: OutboxRelayDriver;

    beforeEach(() => {
        driver = makeOutboxRelayDriver();
    });

    it('dispatches an unprocessed event then marks it processed', async () => {
        await driver.given.unprocessedEvent(OutboxEventType.BookCreated);

        await driver.when.poll();

        driver.assert.dispatched(OutboxEventType.BookCreated);
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

    it('increments the delivery count and leaves the event unprocessed when dispatch fails', async () => {
        const failingId = await driver.given.unprocessedEvent(OutboxEventType.BookCreated);
        driver.given.failingDispatchFor(failingId);

        await driver.when.poll();

        driver.assert.loggedWarn(failingId);
        await driver.assert.deliveryCount(failingId, 1);
        await driver.assert.unprocessedCount(1);
    });

    it('continues dispatching other events when one event fails to dispatch', async () => {
        const failingId = await driver.given.unprocessedEvent(OutboxEventType.BookCreated);
        await driver.given.unprocessedEvent(OutboxEventType.BookUpdated);

        driver.given.failingDispatchFor(failingId);

        await driver.when.poll();

        driver.assert.dispatched(OutboxEventType.BookUpdated);
        await driver.assert.unprocessedCount(1);
    });

    it('dead-letters the event and stops retrying after the retry limit is reached', async () => {
        const failingDriver = makeOutboxRelayDriver({ maxRetries: 2 });
        const failingId = await failingDriver.given.unprocessedEvent(OutboxEventType.BookCreated);
        failingDriver.given.failingDispatchFor(failingId);

        await failingDriver.when.poll();
        await failingDriver.when.poll();

        failingDriver.assert.deadLettered(failingId, 2);
        failingDriver.assert.loggedError(failingId);
        await failingDriver.assert.noUnprocessedEvents();
    });
});
