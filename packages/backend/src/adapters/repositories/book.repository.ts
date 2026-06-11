import { and, asc, count, desc, eq } from 'drizzle-orm';
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

import { Db } from '../../db/client.ts';
import { books } from '../../db/schema.ts';
import { mapBookRow } from './row-mappers.utils.ts';
import { BookRepositoryPort } from '../../domain/ports/book-repository.port.ts';
import { ConflictError, NotFoundError, conflictMessage, notFoundMessage } from '../../domain/errors';

const DEFAULT_PAGE_SIZE = 20;

// Sort column lookup — adding a new sort field means adding one entry here, nothing else.
type BookSortColumn = typeof books.title | typeof books.rating | typeof books.createdAt;

const sortColumnMap: Record<BookSortField, BookSortColumn> = {
    [BookSortField.Title]: books.title,
    [BookSortField.Rating]: books.rating,
    [BookSortField.CreatedAt]: books.createdAt,
};

export class BookRepository implements BookRepositoryPort {
    constructor(private readonly db: Db) {}

    async findById(id: string): Promise<Book | undefined> {
        const row = await this.db.query.books.findFirst({ where: eq(books.id, id) });
        if (row === undefined) {
            return undefined;
        }

        return mapBookRow(row);
    }

    async list(query: BookQueryDto): Promise<PaginatedResult<Book>> {
        const sortBy = query.sortBy ?? BookSortField.CreatedAt;
        const sortDir = query.sortDir ?? SortDirection.Desc;
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

        const sortColumn = sortColumnMap[sortBy];
        const orderExpr = sortDir === SortDirection.Asc ? asc(sortColumn) : desc(sortColumn);

        // and() treats undefined args as absent — no WHERE clause when both are undefined.
        const whereClause = and(
            query.shelfId !== undefined ? eq(books.shelfId, query.shelfId) : undefined,
            query.status !== undefined ? eq(books.status, query.status) : undefined,
        );

        const [rows, totalResult] = await Promise.all([
            this.db
                .select()
                .from(books)
                .where(whereClause)
                .orderBy(orderExpr)
                .limit(pageSize)
                .offset((page - 1) * pageSize),
            this.db.select({ count: count() }).from(books).where(whereClause),
        ]);

        const total = totalResult[0]?.count ?? 0;

        return {
            items: rows.map(mapBookRow),
            page,
            pageSize,
            total,
        };
    }

    async insert(dto: CreateBookDto): Promise<Book> {
        // Set timestamps explicitly so the DB stores millisecond-precision values that
        // round-trip cleanly through JavaScript Date (which has ms precision, not μs).
        // Relying on defaultNow() would give PostgreSQL μs precision that JavaScript
        // cannot represent, breaking the updatedAt token comparison in updateWithToken.
        const now = new Date();

        const [row] = await this.db
            .insert(books)
            .values({
                title: dto.title,
                authorId: dto.authorId,
                shelfId: dto.shelfId,
                status: dto.status,
                createdAt: now,
                updatedAt: now,
            })
            .returning();

        if (row === undefined) {
            throw new Error('insert: expected a returned row but got none');
        }

        return mapBookRow(row);
    }

    async updateWithToken(dto: UpdateBookDto): Promise<Book> {
        // Guarantee updatedAt strictly increases even if wall-clock hasn't ticked.
        const updatedAt = new Date(Math.max(Date.now(), dto.updatedAt.getTime() + 1));

        const statusUpdate = dto.status !== undefined ? { status: dto.status } : {};
        const ratingUpdate = dto.rating !== undefined ? { rating: dto.rating } : {};

        // Atomic check-and-update: the WHERE clause enforces the optimistic lock token.
        // If 0 rows are affected the UPDATE returns nothing; we then distinguish the cause.
        const [updated] = await this.db
            .update(books)
            .set({ ...statusUpdate, ...ratingUpdate, updatedAt })
            .where(and(eq(books.id, dto.id), eq(books.updatedAt, dto.updatedAt)))
            .returning();

        if (updated !== undefined) {
            return mapBookRow(updated);
        }

        // No row matched — determine whether the book is missing or the token is stale.
        const existing = await this.db.select().from(books).where(eq(books.id, dto.id)).limit(1);
        const existingRow = existing[0];
        if (existingRow === undefined) {
            throw new NotFoundError(notFoundMessage('updateWithToken', EntityKind.Book, dto.id));
        }
        throw new ConflictError(conflictMessage('updateWithToken', dto.id, existingRow.updatedAt));
    }

    async delete(id: string): Promise<void> {
        const [deleted] = await this.db.delete(books).where(eq(books.id, id)).returning({ id: books.id });
        if (deleted === undefined) {
            throw new NotFoundError(notFoundMessage('delete', EntityKind.Book, id));
        }
    }
}
