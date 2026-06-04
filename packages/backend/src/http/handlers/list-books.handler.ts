import { Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

import { StorePort } from '../../domain/ports/store.port.js';
import { listBooks } from '../../domain/queries/list-books.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { parseBookQuery } from './list-books.handler.utils.js';

type ListBooksDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeListBooksHandler =
    ({ store, logger }: ListBooksDeps): RequestHandler =>
    async (req: Request, res: Response): Promise<void> => {
        logger.info({}, 'listBooks: started');

        const queryResult = parseBookQuerySafe(req.query);
        if (queryResult.error !== undefined) {
            res.status(400).json({ error: queryResult.error });
            return;
        }

        const result = await listBooks({ bookRepo: store.books }, queryResult.data);
        res.json(result);
    };

type ParseResult = { data: ReturnType<typeof parseBookQuery>; error: undefined } | { data: undefined; error: string };

const parseBookQuerySafe = (raw: unknown): ParseResult => {
    try {
        return { data: parseBookQuery(raw), error: undefined };
    } catch (err) {
        if (err instanceof ZodError) {
            return { data: undefined, error: err.issues.map((i) => i.message).join(', ') };
        }
        throw err;
    }
};
