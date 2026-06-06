import { RequestHandler, Response } from 'express';

import { deleteBook } from '../../domain/commands/delete-book.js';
import { StorePort } from '../../domain/ports/store.port.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { errorToHttpStatus } from '../http-error.utils.js';
import { ValidatedRequest } from '../middleware/validate.middleware.js';

type DeleteBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeDeleteBookHandler =
    ({ store, logger }: DeleteBookDeps): RequestHandler =>
    async (req: ValidatedRequest<{ params: { id: string } }>, res: Response): Promise<void> => {
        const { id } = req.validated!.params;
        logger.info({}, 'deleteBook: handler started', { id });

        try {
            await deleteBook({ store, logger }, id);
            res.status(204).send();
        } catch (err) {
            if (err instanceof Error) {
                res.status(errorToHttpStatus(err)).json({ error: err.message });
                return;
            }
            throw err;
        }
    };
