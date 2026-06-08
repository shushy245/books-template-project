import { RequestHandler, Response } from 'express';

import { StorePort } from '../../domain/ports/store.port.js';
import { listAuthors } from '../../domain/queries/list-authors.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { errorToHttpStatus } from '../http-error.utils.js';
import { ValidatedRequest } from '../middleware/validate.middleware.js';

type ListAuthorsDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeListAuthorsHandler =
    ({ store, logger }: ListAuthorsDeps): RequestHandler =>
    async (_req: ValidatedRequest, res: Response): Promise<void> => {
        logger.info({}, 'listAuthors: started');

        try {
            const authors = await listAuthors({ authorRepo: store.authors });
            res.json(authors);
        } catch (err) {
            if (err instanceof Error) {
                res.status(errorToHttpStatus(err)).json({ error: err.message });
                return;
            }
            throw err;
        }
    };
