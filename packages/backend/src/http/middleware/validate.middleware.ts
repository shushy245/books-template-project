import { ZodError, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export type ValidatedRequest<T = Record<string, unknown>> = Request & {
    validated?: T;
};

const formatZodError = (err: ZodError): string => err.issues.map((i) => i.message).join(', ');

export const requireValidated = <T>(req: ValidatedRequest<T>): T => {
    if (req.validated === undefined) {
        throw new Error('requireValidated: req.validated missing — validation middleware did not run for this route');
    }

    return req.validated;
};

export const validate =
    <T>(schema: ZodSchema<T>) =>
    (req: ValidatedRequest<T>, res: Response, next: NextFunction): void => {
        const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });

        if (!result.success) {
            res.status(400).json({ error: formatZodError(result.error) });

            return;
        }

        req.validated = result.data;
        next();
    };
