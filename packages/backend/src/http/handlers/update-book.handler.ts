import { Request, RequestHandler, Response } from 'express';
import { ZodError } from 'zod';

import { StorePort } from '../../domain/ports/store.port.js';
import { updateBook } from '../../domain/commands/update-book.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { errorToHttpStatus } from '../http-error.utils.js';
import { parseUpdateBookBody, parseUpdateBookParams } from './update-book.handler.utils.js';

type UpdateBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeUpdateBookHandler =
    ({ store, logger }: UpdateBookDeps): RequestHandler =>
    async (req: Request, res: Response): Promise<void> => {
        logger.info({}, 'updateBook: handler started', { id: req.params['id'] });

        const paramsResult = parseSafe(() => parseUpdateBookParams(req.params));
        if (paramsResult.error !== undefined) {
            res.status(400).json({ error: paramsResult.error });
            return;
        }

        const bodyResult = parseSafe(() => parseUpdateBookBody(req.body));
        if (bodyResult.error !== undefined) {
            res.status(400).json({ error: bodyResult.error });
            return;
        }

        try {
            const book = await updateBook({ store, logger }, { id: paramsResult.data.id, ...bodyResult.data });
            res.json(book);
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
