import { Router } from 'express';

import { StorePort } from '../domain/ports/store.port.js';
import { LoggerPort } from '../telemetry/logger.port.js';
import { makeDeleteBookHandler } from './handlers/delete-book.handler.js';
import { makeListBooksHandler } from './handlers/list-books.handler.js';
import { makeUpdateBookHandler } from './handlers/update-book.handler.js';

type RouterDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const buildRouter = ({ store, logger }: RouterDeps): Router => {
    const router = Router();

    router.get('/books', makeListBooksHandler({ store, logger }));
    router.patch('/books/:id', makeUpdateBookHandler({ store, logger }));
    router.delete('/books/:id', makeDeleteBookHandler({ store, logger }));

    return router;
};
