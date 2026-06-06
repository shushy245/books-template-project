import { RequestHandler, Response } from 'express';

import { BookQueryDto } from '@reading-room/common';

import { StorePort } from '../../domain/ports/store.port.js';
import { listBooks } from '../../domain/queries/list-books.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { ValidatedRequest } from '../middleware/validate.middleware.js';

type ListBooksDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeListBooksHandler =
    ({ store, logger }: ListBooksDeps): RequestHandler =>
    async (req: ValidatedRequest<{ query: BookQueryDto }>, res: Response): Promise<void> => {
        logger.info({}, 'listBooks: started');

        const result = await listBooks({ bookRepo: store.books }, req.validated!.query);
        res.json(result);
    };
