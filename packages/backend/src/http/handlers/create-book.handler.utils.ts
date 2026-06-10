import { z } from 'zod';
import { CreateBookDto, ReadingStatus } from '@reading-room/common';

// Every CreateBookDto field is required, so the parsed object already matches the DTO shape —
// no .transform() is needed here (unlike UpdateBook, whose optional fields require one to
// satisfy exactOptionalPropertyTypes).
export const CreateBookBodySchema = z.object({
    title: z.string().min(1),
    authorId: z.string().uuid(),
    shelfId: z.string().uuid(),
    status: z.nativeEnum(ReadingStatus),
});

export const CreateBookRequestSchema = z.object({ body: CreateBookBodySchema });

export const parseCreateBookBody = (raw: unknown): CreateBookDto => CreateBookBodySchema.parse(raw);
