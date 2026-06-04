import { z } from 'zod';

import { ReadingStatus, UpdateBookDto } from '@reading-room/common';

export const UpdateBookParamsSchema = z.object({
    id: z.string().uuid(),
});

export const UpdateBookBodySchema = z
    .object({
        updatedAt: z.string().datetime(),
        status: z.nativeEnum(ReadingStatus).optional(),
        rating: z.number().int().min(1).max(5).optional(),
    })
    .transform((data): Omit<UpdateBookDto, 'id'> => {
        const result: Omit<UpdateBookDto, 'id'> = { updatedAt: new Date(data.updatedAt) };
        if (data.status !== undefined) result.status = data.status;
        if (data.rating !== undefined) result.rating = data.rating;

        return result;
    });

export const parseUpdateBookParams = (raw: unknown): { id: string } => UpdateBookParamsSchema.parse(raw);

export const parseUpdateBookBody = (raw: unknown): Omit<UpdateBookDto, 'id'> => UpdateBookBodySchema.parse(raw);
