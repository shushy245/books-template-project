import { randomUUID } from 'crypto';
import {
    Book,
    BookQueryDto,
    BookSortField,
    CreateBookDto,
    EntityKind,
    PaginatedResult,
    SortDirection,
    UpdateBookDto,
} from '@reading-room/common';

import { BookRepositoryPort } from '../domain/ports/book-repository.port.ts';
import { ConflictError, NotFoundError, conflictMessage, notFoundMessage } from '../domain/errors';

const DEFAULT_PAGE_SIZE = 20;

const sortFnMap: Record<BookSortField, (a: Book, b: Book) => number> = {
    [BookSortField.Title]: (a, b) => a.title.localeCompare(b.title),
    [BookSortField.Rating]: (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
    [BookSortField.CreatedAt]: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
};

export class FakeBookRepository implements BookRepositoryPort {
    private readonly store: Map<string, Book> = new Map();
    // Ensures each insert gets a strictly increasing createdAt even in rapid succession.
    private insertTick = 0;

    async findById(id: string): Promise<Book | undefined> {
        return this.store.get(id);
    }

    async list(query: BookQueryDto): Promise<PaginatedResult<Book>> {
        const sortBy = query.sortBy ?? BookSortField.CreatedAt;
        const sortDir = query.sortDir ?? SortDirection.Desc;

        const compareFn = sortFnMap[sortBy];
        if (compareFn === undefined) {
            throw new Error(`list: unexpected BookSortField '${sortBy}'`);
        }

        const filtered = [...this.store.values()]
            .filter((b) => query.shelfId === undefined || b.shelfId === query.shelfId)
            .filter((b) => query.status === undefined || b.status === query.status);

        const sorted = [...filtered].sort(compareFn);
        const ordered = sortDir === SortDirection.Desc ? [...sorted].reverse() : sorted;

        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
        const start = (page - 1) * pageSize;

        return { items: ordered.slice(start, start + pageSize), page, pageSize, total: ordered.length };
    }

    async insert(dto: CreateBookDto): Promise<Book> {
        const now = new Date(Date.now() + this.insertTick);
        this.insertTick += 1;

        const book: Book = {
            id: randomUUID(),
            title: dto.title,
            authorId: dto.authorId,
            shelfId: dto.shelfId,
            status: dto.status,
            createdAt: now,
            updatedAt: now,
        };
        this.store.set(book.id, book);

        return book;
    }

    async updateWithToken(dto: UpdateBookDto): Promise<Book> {
        const existing = this.store.get(dto.id);
        if (existing === undefined) {
            throw new NotFoundError(notFoundMessage('updateWithToken', EntityKind.Book, dto.id));
        }
        if (existing.updatedAt.getTime() !== dto.updatedAt.getTime()) {
            throw new ConflictError(conflictMessage('updateWithToken', dto.id, existing.updatedAt));
        }

        // Guarantee updatedAt strictly increases even if wall-clock hasn't ticked.
        const updatedAt = new Date(Math.max(Date.now(), existing.updatedAt.getTime() + 1));

        const statusUpdate = dto.status !== undefined ? { status: dto.status } : {};
        const ratingUpdate = dto.rating !== undefined ? { rating: dto.rating } : {};
        const updated: Book = { ...existing, ...statusUpdate, ...ratingUpdate, updatedAt };

        this.store.set(updated.id, updated);

        return updated;
    }

    async delete(id: string): Promise<void> {
        if (!this.store.has(id)) {
            throw new NotFoundError(notFoundMessage('delete', EntityKind.Book, id));
        }
        this.store.delete(id);
    }
}
