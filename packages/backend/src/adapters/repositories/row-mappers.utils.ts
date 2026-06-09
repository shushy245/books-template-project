// row-mappers.utils.ts — the only backend file sanctioned to touch null (ADR-8).
// Drizzle returns null for nullable DB columns; this module normalises null → undefined
// so the rest of the application deals only with T | undefined.

import { Book, ReadingStatus } from '@reading-room/common';

import * as schema from '../../db/schema.ts';

type BookRow = typeof schema.books.$inferSelect;

// Build the valid-status set once at module load — reused on every row map.
const validReadingStatuses: ReadonlySet<string> = new Set<string>(Object.values(ReadingStatus));

const isReadingStatus = (value: string): value is ReadingStatus => validReadingStatuses.has(value);

export const mapBookRow = (row: BookRow): Book => {
    if (!isReadingStatus(row.status)) {
        throw new Error(`mapBookRow: unknown ReadingStatus '${row.status}' for book id=${row.id}`);
    }

    // rating is the only nullable column in books; null → absent field here at the boundary.
    const ratingField = row.rating !== null ? { rating: row.rating } : {};

    return {
        id: row.id,
        title: row.title,
        authorId: row.authorId,
        shelfId: row.shelfId,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        ...ratingField,
    };
};
