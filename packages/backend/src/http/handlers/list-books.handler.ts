import { RequestHandler, Response } from 'express';
import { BookQueryDto } from '@reading-room/common';

import { errorToHttpStatus } from '../http-error.utils.ts';
import { LoggerPort } from '../../telemetry/logger.port.ts';
import { StorePort } from '../../domain/ports/store.port.ts';
import { listBooks } from '../../domain/queries/list-books.ts';
import { ValidatedRequest, requireValidated } from '../middleware/validate.middleware.ts';

type ListBooksDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeListBooksHandler =
    ({ store, logger }: ListBooksDeps): RequestHandler =>
    async (req: ValidatedRequest<{ query: BookQueryDto }>, res: Response): Promise<void> => {
        const { query } = requireValidated(req);
        logger.info({}, 'listBooks: started');

        try {
            const result = await listBooks({ bookRepo: store.books }, query);
            res.json(result);
        } catch (err) {
            if (err instanceof Error) {
                res.status(errorToHttpStatus(err)).json({ error: err.message });

                return;
            }
            throw err;
        }
    };
