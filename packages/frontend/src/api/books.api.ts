import { Book, BookQueryDto, CreateBookDto, PaginatedResult, ReadingStatus } from '@reading-room/common';

import { httpClient } from './http-client.ts';
import { buildBooksQueryString } from '../features/books/book-list.utils.ts';

export const fetchBooks = async (query: BookQueryDto): Promise<PaginatedResult<Book>> => {
    const qs = buildBooksQueryString(query);
    const response = await httpClient.get<PaginatedResult<Book>>(`/books${qs ? `?${qs}` : ''}`);

    return response.data;
};

export const createBook = async (dto: CreateBookDto): Promise<Book> => {
    const response = await httpClient.post<Book>('/books', dto);

    return response.data;
};

type UpdateBookRequest = {
    id: string;
    updatedAt: string;
    status?: ReadingStatus;
    rating?: number;
};

export const patchBook = async (req: UpdateBookRequest): Promise<Book> => {
    const body: Record<string, unknown> = { updatedAt: req.updatedAt };
    if (req.status !== undefined) body['status'] = req.status;
    if (req.rating !== undefined) body['rating'] = req.rating;

    const response = await httpClient.patch<Book>(`/books/${req.id}`, body);

    return response.data;
};

export const deleteBook = async (id: string): Promise<void> => {
    await httpClient.delete(`/books/${id}`);
};
