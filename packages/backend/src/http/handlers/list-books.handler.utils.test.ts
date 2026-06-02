import { describe, expect, it } from 'vitest';

import { BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

import { parseBookQuery } from './list-books.handler.utils.js';

type ParseDriver = {
    assertParsed: (raw: Record<string, unknown>, expected: ReturnType<typeof parseBookQuery>) => void;
    assertRejects: (raw: Record<string, unknown>) => void;
};

const makeParseDriver = (): ParseDriver => ({
    assertParsed: (raw, expected) => {
        expect(parseBookQuery(raw)).toEqual(expected);
    },
    assertRejects: (raw) => {
        expect(() => parseBookQuery(raw)).toThrow();
    },
});

describe('parseBookQuery', () => {
    const driver = makeParseDriver();

    it('returns an empty query dto for empty params', () => {
        driver.assertParsed({}, {});
    });

    it('parses valid sort field and direction', () => {
        driver.assertParsed(
            { sortBy: 'Rating', sortDir: 'Asc' },
            { sortBy: BookSortField.Rating, sortDir: SortDirection.Asc },
        );
    });

    it('parses valid status filter', () => {
        driver.assertParsed({ status: 'Reading' }, { status: ReadingStatus.Reading });
    });

    it('coerces page and pageSize from string to number', () => {
        driver.assertParsed({ page: '3', pageSize: '20' }, { page: 3, pageSize: 20 });
    });

    it('rejects an invalid sort field', () => {
        driver.assertRejects({ sortBy: 'invalid' });
    });

    it('rejects page less than 1', () => {
        driver.assertRejects({ page: '0' });
    });

    it('rejects pageSize less than 1', () => {
        driver.assertRejects({ pageSize: '0' });
    });
});
