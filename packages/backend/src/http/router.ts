import { Router } from 'express';

import { BookRepositoryPort } from '../domain/ports/book-repository.port.js';
import { Logger } from '../telemetry/logger.port.js';
import { makeListBooksHandler } from './handlers/list-books.handler.js';

type RouterDeps = {
    bookRepo: BookRepositoryPort;
    logger: Logger;
};

export const buildRouter = (deps: RouterDeps): Router => {
    const router = Router();

    router.get('/books', makeListBooksHandler({ bookRepo: deps.bookRepo, logger: deps.logger }));

    return router;
};
