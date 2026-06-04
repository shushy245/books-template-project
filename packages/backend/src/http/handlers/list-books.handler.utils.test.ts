import { describe, it } from 'vitest';

import { BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

import { ParseBookQueryDriver, makeParseBookQueryDriver } from './list-books.handler.utils.driver.js';

describe('parseBookQuery', () => {
    const driver: ParseBookQueryDriver = makeParseBookQueryDriver();

    it('returns an empty query dto for empty params', () => {
        driver.assert.parsed({}, {});
    });

    it('parses valid sort field and direction', () => {
        driver.assert.parsed(
            { sortBy: 'Rating', sortDir: 'Asc' },
            { sortBy: BookSortField.Rating, sortDir: SortDirection.Asc },
        );
    });

    it('parses valid status filter', () => {
        driver.assert.parsed({ status: 'Reading' }, { status: ReadingStatus.Reading });
    });

    it('coerces page and pageSize from string to number', () => {
        driver.assert.parsed({ page: '3', pageSize: '20' }, { page: 3, pageSize: 20 });
    });

    it('rejects an invalid sort field', () => {
        driver.assert.rejects({ sortBy: 'invalid' });
    });

    it('rejects page less than 1', () => {
        driver.assert.rejects({ page: '0' });
    });

    it('rejects pageSize less than 1', () => {
        driver.assert.rejects({ pageSize: '0' });
    });
});
