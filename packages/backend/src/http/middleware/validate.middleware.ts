import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export type ValidatedRequest<T = Record<string, unknown>> = Request & {
    validated?: T;
};

type Source = 'body' | 'params' | 'query';

const getSourceData = (req: Request, source: Source): unknown => {
    switch (source) {
        case 'body':
            return req.body;
        case 'params':
            return req.params;
        case 'query':
            return req.query;
    }
};

const formatZodError = (err: ZodError): string => err.issues.map((i) => i.message).join(', ');

export const createValidator = <T>(
    schema: ZodSchema,
    source: Source = 'body',
): ((req: ValidatedRequest<T>, res: Response, next: NextFunction) => void) => {
    return (req: ValidatedRequest<T>, res: Response, next: NextFunction): void => {
        const data = getSourceData(req, source);
        const result = schema.safeParse(data);

        if (!result.success) {
            res.status(400).json({ error: formatZodError(result.error) });
            return;
        }

        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        req.validated = result.data as T;
        next();
    };
};
