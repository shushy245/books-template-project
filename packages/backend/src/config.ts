import { z } from 'zod';

const ConfigSchema = z.object({
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    PORT: z.coerce.number().int().positive().default(3000),
    OUTBOX_RELAY_INTERVAL_MS: z.coerce.number().int().positive().default(5000),
});

export const config = ConfigSchema.parse(process.env);
