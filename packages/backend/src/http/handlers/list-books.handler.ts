import { Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

import { BookRepositoryPort } from '../../domain/ports/book-repository.port.js';
import { listBooks } from '../../domain/queries/list-books.query.js';
import { Logger } from '../../telemetry/logger.port.js';
import { parseBookQuery } from './list-books.handler.utils.js';

type ListBooksDeps = {
    bookRepo: BookRepositoryPort;
    logger: Logger;
};

export const makeListBooksHandler =
    (deps: ListBooksDeps): RequestHandler =>
    async (req: Request, res: Response): Promise<void> => {
        deps.logger.info({}, 'listBooks: started');

        const queryResult = parseBookQuerySafe(req.query);
        if (queryResult.error !== undefined) {
            res.status(400).json({ error: queryResult.error });
            return;
        }

        const result = await listBooks({ bookRepo: deps.bookRepo }, queryResult.data);
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
