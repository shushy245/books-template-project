import { describe, expect, it } from 'vitest';

import { BookSortField, SortDirection } from '@reading-room/common';

import { buildBooksQueryString } from './book-list.utils.js';

type QueryStringDriver = {
    assertQueryString: (input: Parameters<typeof buildBooksQueryString>[0], expected: string) => void;
};

const makeQueryStringDriver = (): QueryStringDriver => ({
    assertQueryString: (input, expected) => {
        expect(buildBooksQueryString(input)).toBe(expected);
    },
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
