import { Router } from 'express';

import { StorePort } from '../domain/ports/store.port.js';
import { LoggerPort } from '../telemetry/logger.port.js';
import { validate } from './middleware/validate.middleware.js';
import { makeDeleteBookHandler } from './handlers/delete-book.handler.js';
import { DeleteBookRequestSchema } from './handlers/delete-book.handler.utils.js';
import { makeListBooksHandler } from './handlers/list-books.handler.js';
import { ListBooksRequestSchema } from './handlers/list-books.handler.utils.js';
import { makeUpdateBookHandler } from './handlers/update-book.handler.js';
import { UpdateBookRequestSchema } from './handlers/update-book.handler.utils.js';

type RouterDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const buildRouter = ({ store, logger }: RouterDeps): Router => {
    const router = Router();

    router.get('/books', validate(ListBooksRequestSchema), makeListBooksHandler({ store, logger }));
    router.patch('/books/:id', validate(UpdateBookRequestSchema), makeUpdateBookHandler({ store, logger }));
    router.delete('/books/:id', validate(DeleteBookRequestSchema), makeDeleteBookHandler({ store, logger }));

    return router;
};
