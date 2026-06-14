import { Book, BookQueryDto, CreateBookDto, PaginatedResult, ReadingStatus } from '@reading-room/common';

import { bookModel } from '~/models';

import { httpClient } from './http-client.ts';

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

export const fetchBooks = async (query: BookQueryDto): Promise<PaginatedResult<Book>> => {
    const qs = buildBooksQueryString(query);
    const response = await httpClient.get<PaginatedResult<bookModel.BookWireDTO>>(`/books${qs ? `?${qs}` : ''}`);

    return { ...response.data, items: response.data.items.map(bookModel.fromDTO) };
};

export const createBook = async (dto: CreateBookDto): Promise<Book> => {
    const response = await httpClient.post<bookModel.BookWireDTO>('/books', bookModel.toCreatePayload(dto));

    return bookModel.fromDTO(response.data);
};

export const patchBook = async (update: { book: Book; status?: ReadingStatus; rating?: number }): Promise<Book> => {
    const response = await httpClient.patch<bookModel.BookWireDTO>(
        `/books/${update.book.id}`,
        bookModel.toUpdatePayload(update.book, update),
    );

    return bookModel.fromDTO(response.data);
};

export const deleteBook = async (id: string): Promise<void> => {
    await httpClient.delete(`/books/${id}`);
};
