import { z } from 'zod';
import { BookQueryDto, BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

// .transform() builds BookQueryDto explicitly — setting only defined fields — to satisfy
// exactOptionalPropertyTypes (which rejects `T | undefined` assigned to an optional `T` property).
export const BookQueryParamsSchema = z
    .object({
        shelfId: z.string().optional(),
        status: z.nativeEnum(ReadingStatus).optional(),
        sortBy: z.nativeEnum(BookSortField).optional(),
        sortDir: z.nativeEnum(SortDirection).optional(),
        page: z.coerce.number().int().min(1).optional(),
        pageSize: z.coerce.number().int().min(1).optional(),
    })
    .transform((data): BookQueryDto => {
        const dto: BookQueryDto = {};
        if (data.shelfId !== undefined) dto.shelfId = data.shelfId;
        if (data.status !== undefined) dto.status = data.status;
        if (data.sortBy !== undefined) dto.sortBy = data.sortBy;
        if (data.sortDir !== undefined) dto.sortDir = data.sortDir;
        if (data.page !== undefined) dto.page = data.page;
        if (data.pageSize !== undefined) dto.pageSize = data.pageSize;

        return dto;
    });

export const ListBooksRequestSchema = z.object({ query: BookQueryParamsSchema });

export const parseBookQuery = (raw: unknown): BookQueryDto => BookQueryParamsSchema.parse(raw);
