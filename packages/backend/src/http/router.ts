import { Router } from 'express';

import { StorePort } from '../domain/ports/store.port.js';
import { LoggerPort } from '../telemetry/logger.port.js';
import { validate } from './middleware/validate.middleware.js';
import { makeCreateBookHandler } from './handlers/create-book.handler.js';
import { CreateBookRequestSchema } from './handlers/create-book.handler.utils.js';
import { makeDeleteBookHandler } from './handlers/delete-book.handler.js';
import { DeleteBookRequestSchema } from './handlers/delete-book.handler.utils.js';
import { makeListAuthorsHandler } from './handlers/list-authors.handler.js';
import { makeListShelvesHandler } from './handlers/list-shelves.handler.js';
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
    router.post('/books', validate(CreateBookRequestSchema), makeCreateBookHandler({ store, logger }));
    router.patch('/books/:id', validate(UpdateBookRequestSchema), makeUpdateBookHandler({ store, logger }));
    router.delete('/books/:id', validate(DeleteBookRequestSchema), makeDeleteBookHandler({ store, logger }));

    router.get('/authors', makeListAuthorsHandler({ store, logger }));
    router.get('/shelves', makeListShelvesHandler({ store, logger }));

    return router;
};
