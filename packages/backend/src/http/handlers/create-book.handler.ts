import { RequestHandler, Response } from 'express';

import { CreateBookDto } from '@reading-room/common';

import { StorePort } from '../../domain/ports/store.port.js';
import { createBook } from '../../domain/commands/create-book.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { errorToHttpStatus } from '../http-error.utils.js';
import { ValidatedRequest } from '../middleware/validate.middleware.js';

type CreateBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeCreateBookHandler =
    ({ store, logger }: CreateBookDeps): RequestHandler =>
    async (req: ValidatedRequest<{ body: CreateBookDto }>, res: Response): Promise<void> => {
        const { body } = req.validated!;
        logger.info({}, 'createBook: handler started', { shelfId: body.shelfId, authorId: body.authorId });

        try {
            const book = await createBook({ store, logger }, body);
            res.status(201).json(book);
        } catch (err) {
            if (err instanceof Error) {
                res.status(errorToHttpStatus(err)).json({ error: err.message });
                return;
            }
            throw err;
        }
    };
