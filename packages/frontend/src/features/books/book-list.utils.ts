import { BookQueryDto, BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

const validSortFields = new Set<string>(Object.values(BookSortField));
const validSortDirections = new Set<string>(Object.values(SortDirection));

export const isBookSortField = (value: string): value is BookSortField => validSortFields.has(value);
export const isSortDirection = (value: string): value is SortDirection => validSortDirections.has(value);

export const buildBooksQueryString = (query: BookQueryDto): string => {
    const params = new URLSearchParams();
    if (query.shelfId !== undefined) params.set('shelfId', query.shelfId);
    if (query.status !== undefined) params.set('status', query.status);
    if (query.sortBy !== undefined) params.set('sortBy', query.sortBy);
    if (query.sortDir !== undefined) params.set('sortDir', query.sortDir);
    if (query.page !== undefined) params.set('page', String(query.page));
    if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
    return params.toString();
};

export const readingStatusLabelMap: Record<ReadingStatus, string> = {
    [ReadingStatus.WantToRead]: 'Want to read',
    [ReadingStatus.Reading]: 'Reading',
    [ReadingStatus.Read]: 'Read',
    [ReadingStatus.Abandoned]: 'Abandoned',
};

export const sortFieldLabelMap: Record<BookSortField, string> = {
    [BookSortField.Title]: 'Title',
    [BookSortField.Rating]: 'Rating',
    [BookSortField.CreatedAt]: 'Date added',
};

export const sortDirectionLabelMap: Record<SortDirection, string> = {
    [SortDirection.Asc]: 'Ascending',
    [SortDirection.Desc]: 'Descending',
};
