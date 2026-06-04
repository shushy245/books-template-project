import { z } from 'zod';

export const DeleteBookParamsSchema = z.object({
    id: z.string().uuid(),
});

export const parseDeleteBookParams = (raw: unknown): { id: string } => DeleteBookParamsSchema.parse(raw);
