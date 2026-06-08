import { RequestHandler, Response } from 'express';

import { StorePort } from '../../domain/ports/store.port.js';
import { listShelves } from '../../domain/queries/list-shelves.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { errorToHttpStatus } from '../http-error.utils.js';
import { ValidatedRequest } from '../middleware/validate.middleware.js';

type ListShelvesDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeListShelvesHandler =
    ({ store, logger }: ListShelvesDeps): RequestHandler =>
    async (_req: ValidatedRequest, res: Response): Promise<void> => {
        logger.info({}, 'listShelves: started');

        try {
            const shelves = await listShelves({ shelfRepo: store.shelves });
            res.json(shelves);
        } catch (err) {
            if (err instanceof Error) {
                res.status(errorToHttpStatus(err)).json({ error: err.message });
                return;
            }
            throw err;
        }
    };
