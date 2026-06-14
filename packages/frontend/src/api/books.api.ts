import { Book, BookQueryDto, CreateBookDto, PaginatedResult, ReadingStatus } from '@reading-room/common';

import { httpClient } from './http-client.ts';

// ── Translators ──────────────────────────────────────────────────────────────
// All wire-format translation happens here. No other layer builds or unpacks
// API request/response shapes.

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

type BookPatchUpdate = {
    book: Book;
    status?: ReadingStatus;
    rating?: number;
};

const toPatchBody = ({ book, status, rating }: BookPatchUpdate): Record<string, unknown> => {
    const body: Record<string, unknown> = { updatedAt: String(book.updatedAt) };
    if (status !== undefined) body['status'] = status;
    if (rating !== undefined) body['rating'] = rating;

    return body;
};

// ── API ───────────────────────────────────────────────────────────────────────

export const fetchBooks = async (query: BookQueryDto): Promise<PaginatedResult<Book>> => {
    const qs = buildBooksQueryString(query);
    const response = await httpClient.get<PaginatedResult<Book>>(`/books${qs ? `?${qs}` : ''}`);

    return response.data;
};

export const createBook = async (dto: CreateBookDto): Promise<Book> => {
    const response = await httpClient.post<Book>('/books', { ...dto, title: dto.title.trim() });

    return response.data;
};

export const patchBook = async (update: BookPatchUpdate): Promise<Book> => {
    const response = await httpClient.patch<Book>(`/books/${update.book.id}`, toPatchBody(update));

    return response.data;
};

export const deleteBook = async (id: string): Promise<void> => {
    await httpClient.delete(`/books/${id}`);
};
