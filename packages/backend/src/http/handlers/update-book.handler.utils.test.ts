import { describe, it } from 'vitest';
import { ReadingStatus } from '@reading-room/common';

import { ParseUpdateBookDriver, makeParseUpdateBookDriver } from './update-book.handler.utils.driver.ts';

describe('parseUpdateBookBody', () => {
    const driver: ParseUpdateBookDriver = makeParseUpdateBookDriver();

    it('parses updatedAt as a Date', () => {
        driver.assert.bodyParsed({ updatedAt: '2024-01-01T00:00:00.000Z' }, {});
    });

    it('parses status when provided', () => {
        driver.assert.bodyParsed(
            { updatedAt: '2024-01-01T00:00:00.000Z', status: 'Reading' },
            { status: ReadingStatus.Reading },
        );
    });

    it('parses rating when provided', () => {
        driver.assert.bodyParsed({ updatedAt: '2024-01-01T00:00:00.000Z', rating: 4 }, { rating: 4 });
    });

    it('rejects a missing updatedAt', () => {
        driver.assert.bodyRejects({ status: 'Reading' });
    });

    it('rejects an invalid rating', () => {
        driver.assert.bodyRejects({ updatedAt: '2024-01-01T00:00:00.000Z', rating: 6 });
    });

    it('rejects an invalid status', () => {
        driver.assert.bodyRejects({ updatedAt: '2024-01-01T00:00:00.000Z', status: 'NotAStatus' });
    });
});

describe('parseUpdateBookParams', () => {
    const driver: ParseUpdateBookDriver = makeParseUpdateBookDriver();

    it('parses a valid uuid', () => {
        driver.assert.paramsParsed(
            { id: '00000000-0000-0000-0000-000000000000' },
            { id: '00000000-0000-0000-0000-000000000000' },
        );
    });

    it('rejects a non-uuid id', () => {
        driver.assert.paramsReject({ id: 'not-a-uuid' });
    });
});
