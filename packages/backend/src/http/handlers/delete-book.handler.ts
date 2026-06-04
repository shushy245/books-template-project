import { Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

import { deleteBook } from '../../domain/commands/delete-book.js';
import { StorePort } from '../../domain/ports/store.port.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { errorToHttpStatus } from '../http-error.utils.js';
import { parseDeleteBookParams } from './delete-book.handler.utils.js';

type DeleteBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeDeleteBookHandler =
    ({ store, logger }: DeleteBookDeps): RequestHandler =>
    async (req: Request, res: Response): Promise<void> => {
        logger.info({}, 'deleteBook: handler started', { id: req.params['id'] });

        const paramsResult = parseSafe(() => parseDeleteBookParams(req.params));
        if (paramsResult.error !== undefined) {
            res.status(400).json({ error: paramsResult.error });
            return;
        }

        try {
            await deleteBook({ store, logger }, paramsResult.data.id);
            res.status(204).send();
        } catch (err) {
            if (err instanceof Error) {
                res.status(errorToHttpStatus(err)).json({ error: err.message });
                return;
            }
            throw err;
        }
    };

type ParseResult<T> = { data: T; error: undefined } | { data: undefined; error: string };

const parseSafe = <T>(fn: () => T): ParseResult<T> => {
    try {
        return { data: fn(), error: undefined };
    } catch (err) {
        if (err instanceof ZodError) {
            return { data: undefined, error: err.issues.map((i) => i.message).join(', ') };
        }
        throw err;
    }
};
