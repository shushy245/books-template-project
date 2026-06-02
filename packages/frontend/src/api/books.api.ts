import { Book, BookQueryDto, PaginatedResult } from '@reading-room/common';

import { buildBooksQueryString } from '../features/books/book-list.utils.js';
import { httpClient } from './http-client.js';

export const fetchBooks = async (query: BookQueryDto): Promise<PaginatedResult<Book>> => {
    const qs = buildBooksQueryString(query);
    const response = await httpClient.get<PaginatedResult<Book>>(`/books${qs ? `?${qs}` : ''}`);
    return response.data;
};
