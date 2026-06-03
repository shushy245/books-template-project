import { describe, expect, it } from 'vitest';

import { ReadingStatus } from '@reading-room/common';

import { parseUpdateBookBody, parseUpdateBookParams } from './update-book.handler.utils.js';

type ParseDriver = {
    assert: {
        bodyParsed: (raw: Record<string, unknown>, expected: Record<string, unknown>) => void;
        paramsParsed: (raw: Record<string, unknown>, expected: { id: string }) => void;
        bodyRejects: (raw: Record<string, unknown>) => void;
        paramsReject: (raw: Record<string, unknown>) => void;
    };
};

const makeParseDriver = (): ParseDriver => ({
    assert: {
        bodyParsed: (raw, expected) => {
            const result = parseUpdateBookBody(raw);
            expect(result).toMatchObject(expected);
            expect(result.updatedAt).toBeInstanceOf(Date);
        },

        paramsParsed: (raw, expected) => {
            expect(parseUpdateBookParams(raw)).toEqual(expected);
        },

        bodyRejects: (raw) => {
            expect(() => parseUpdateBookBody(raw)).toThrow();
        },

        paramsReject: (raw) => {
            expect(() => parseUpdateBookParams(raw)).toThrow();
        },
    },
});

describe('parseUpdateBookBody', () => {
    const driver = makeParseDriver();

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
    const driver = makeParseDriver();

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
