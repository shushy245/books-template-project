import { describe, expect, it } from 'vitest';
import { BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

import { buildBooksQueryString } from '../../api/books.api.ts';
import {
    isBookSortField,
    isReadingStatus,
    isSortDirection,
    readingStatusLabelMap,
    sortDirectionLabelMap,
    sortFieldLabelMap,
} from './book-list.utils.ts';

type QueryStringDriver = {
    assertQueryString: (input: Parameters<typeof buildBooksQueryString>[0], expected: string) => void;
};

const makeQueryStringDriver = (): QueryStringDriver => ({
    assertQueryString: (input, expected) => {
        expect(buildBooksQueryString(input)).toBe(expected);
    },
});

describe('isReadingStatus', () => {
    it.each(Object.values(ReadingStatus))('returns true for valid status %s', (status) => {
        expect(isReadingStatus(status)).toBe(true);
    });

    it('returns false for an arbitrary string', () => {
        expect(isReadingStatus('not-a-status')).toBe(false);
    });
});

describe('isBookSortField', () => {
    it.each(Object.values(BookSortField))('returns true for valid field %s', (field) => {
        expect(isBookSortField(field)).toBe(true);
    });

    it('returns false for an arbitrary string', () => {
        expect(isBookSortField('not-a-field')).toBe(false);
    });
});

describe('isSortDirection', () => {
    it.each(Object.values(SortDirection))('returns true for valid direction %s', (dir) => {
        expect(isSortDirection(dir)).toBe(true);
    });

    it('returns false for an arbitrary string', () => {
        expect(isSortDirection('not-a-direction')).toBe(false);
    });
});

describe('readingStatusLabelMap', () => {
    it.each(Object.values(ReadingStatus))('has a non-empty label for %s', (status) => {
        expect(readingStatusLabelMap[status]).toBeTruthy();
    });
});

describe('sortFieldLabelMap', () => {
    it.each(Object.values(BookSortField))('has a non-empty label for %s', (field) => {
        expect(sortFieldLabelMap[field]).toBeTruthy();
    });
});

describe('sortDirectionLabelMap', () => {
    it.each(Object.values(SortDirection))('has a non-empty label for %s', (dir) => {
        expect(sortDirectionLabelMap[dir]).toBeTruthy();
    });
});

describe('buildBooksQueryString', () => {
    const driver = makeQueryStringDriver();

    it('returns an empty string for an empty query', () => {
        driver.assertQueryString({}, '');
    });

    it('builds a querystring from sort and page state', () => {
        driver.assertQueryString(
            { sortBy: BookSortField.Title, sortDir: SortDirection.Asc, page: 2 },
            'sortBy=Title&sortDir=Asc&page=2',
        );
    });

    it('includes only defined fields', () => {
        driver.assertQueryString({ sortBy: BookSortField.Rating }, 'sortBy=Rating');
    });

    it('includes pageSize when provided', () => {
        driver.assertQueryString({ page: 1, pageSize: 10 }, 'page=1&pageSize=10');
    });
});
