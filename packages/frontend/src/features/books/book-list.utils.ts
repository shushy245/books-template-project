import { BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

const validReadingStatuses = new Set<string>(Object.values(ReadingStatus));
const validSortFields = new Set<string>(Object.values(BookSortField));
const validSortDirections = new Set<string>(Object.values(SortDirection));

export const isReadingStatus = (value: string): value is ReadingStatus => validReadingStatuses.has(value);
export const isBookSortField = (value: string): value is BookSortField => validSortFields.has(value);
export const isSortDirection = (value: string): value is SortDirection => validSortDirections.has(value);

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
