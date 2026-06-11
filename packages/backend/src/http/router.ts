import { Router } from 'express';

import { LoggerPort } from '../telemetry/logger.port.ts';
import { StorePort } from '../domain/ports/store.port.ts';
import { validate } from './middleware/validate.middleware.ts';
import { makeListBooksHandler } from './handlers/list-books.handler.ts';
import { makeCreateBookHandler } from './handlers/create-book.handler.ts';
import { makeDeleteBookHandler } from './handlers/delete-book.handler.ts';
import { makeUpdateBookHandler } from './handlers/update-book.handler.ts';
import { makeListAuthorsHandler } from './handlers/list-authors.handler.ts';
import { makeListShelvesHandler } from './handlers/list-shelves.handler.ts';
import { ListBooksRequestSchema } from './handlers/list-books.handler.utils.ts';
import { makeListDlqEventsHandler } from './handlers/list-dlq-events.handler.ts';
import { CreateBookRequestSchema } from './handlers/create-book.handler.utils.ts';
import { DeleteBookRequestSchema } from './handlers/delete-book.handler.utils.ts';
import { UpdateBookRequestSchema } from './handlers/update-book.handler.utils.ts';

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

    // OPERATOR AUTH REQUIRED before exposing this in production — entries contain raw event payloads.
    // Replay seam: a POST /admin/dlq/:id/replay would re-enqueue the event here.
    router.get('/admin/dlq', makeListDlqEventsHandler({ store, logger }));

    return router;
};
