import { Router } from 'express';

import { StorePort } from '../domain/ports/store.port.js';
import { Logger } from '../telemetry/logger.port.js';
import { makeListBooksHandler } from './handlers/list-books.handler.js';

type RouterDeps = {
    store: StorePort;
    logger: Logger;
};

export const buildRouter = (deps: RouterDeps): Router => {
    const router = Router();

    router.get('/books', makeListBooksHandler({ store: deps.store, logger: deps.logger }));

    return router;
};
