import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export type ValidatedRequest<T = Record<string, unknown>> = Request & {
    validated?: T;
};

type ValidationRule = {
    schema: ZodSchema;
    source: 'body' | 'params' | 'query';
    key: string;
};

const getSourceData = (req: Request, source: 'body' | 'params' | 'query'): unknown => {
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

export const createCombinedValidator =
    (rules: ValidationRule[]) =>
    (req: ValidatedRequest<Record<string, unknown>>, res: Response, next: NextFunction): void => {
        const validated: Record<string, unknown> = {};

        for (const { schema, source, key } of rules) {
            const data = getSourceData(req, source);
            const result = schema.safeParse(data);

            if (!result.success) {
                res.status(400).json({ error: formatZodError(result.error) });
                return;
            }

            validated[key] = result.data;
        }

        req.validated = validated;
        next();
    };
