import { RequestHandler, Response } from 'express';

import { StorePort } from '../../domain/ports/store.port.ts';
import { listAuthors } from '../../domain/queries/list-authors.ts';
import { LoggerPort } from '../../telemetry/logger.port.ts';
import { errorToHttpStatus } from '../http-error.utils.ts';
import { ValidatedRequest } from '../middleware/validate.middleware.ts';

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
