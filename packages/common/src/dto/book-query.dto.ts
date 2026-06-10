import { ReadingStatus } from '../enums/reading-status.ts';
import { SortDirection } from '../enums/sort-direction.ts';
import { BookSortField } from '../enums/book-sort-field.ts';

export type BookQueryDto = {
    shelfId?: string;
    status?: ReadingStatus;
    sortBy?: BookSortField;
    sortDir?: SortDirection;
    page?: number;
    pageSize?: number;
};
