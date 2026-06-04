import { Router } from 'express';

import { StorePort } from '../domain/ports/store.port.js';
import { LoggerPort } from '../telemetry/logger.port.js';
import { createCombinedValidator } from './middleware/validate-combined.middleware.js';
import { createValidator } from './middleware/validate.middleware.js';
import { makeDeleteBookHandler } from './handlers/delete-book.handler.js';
import { makeListBooksHandler } from './handlers/list-books.handler.js';
import { makeUpdateBookHandler } from './handlers/update-book.handler.js';
import { BookQueryParamsSchema } from './handlers/list-books.handler.utils.js';
import { UpdateBookBodySchema, UpdateBookParamsSchema } from './handlers/update-book.handler.utils.js';
import { DeleteBookParamsSchema } from './handlers/delete-book.handler.utils.js';

type RouterDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const buildRouter = ({ store, logger }: RouterDeps): Router => {
    const router = Router();

    router.get('/books', createValidator(BookQueryParamsSchema, 'query'), makeListBooksHandler({ store, logger }));

    router.patch(
        '/books/:id',
        createCombinedValidator([
            { schema: UpdateBookParamsSchema, source: 'params', key: 'params' },
            { schema: UpdateBookBodySchema, source: 'body', key: 'body' },
        ]),
        makeUpdateBookHandler({ store, logger }),
    );

    router.delete(
        '/books/:id',
        createValidator(DeleteBookParamsSchema, 'params'),
        makeDeleteBookHandler({ store, logger }),
    );

    return router;
};
