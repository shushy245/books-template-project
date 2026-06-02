import { BookSortField } from '../enums/book-sort-field.js';
import { ReadingStatus } from '../enums/reading-status.js';
import { SortDirection } from '../enums/sort-direction.js';

export type BookQueryDto = {
    shelfId?: string;
    status?: ReadingStatus;
    sortBy?: BookSortField;
    sortDir?: SortDirection;
    page?: number;
    pageSize?: number;
};
