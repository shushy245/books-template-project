import { RequestHandler, Response } from 'express';

import { errorToHttpStatus } from '../http-error.utils.ts';
import { LoggerPort } from '../../telemetry/logger.port.ts';
import { StorePort } from '../../domain/ports/store.port.ts';
import { deleteBook } from '../../domain/commands/delete-book.ts';
import { ValidatedRequest, requireValidated } from '../middleware/validate.middleware.ts';

type DeleteBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeDeleteBookHandler =
    ({ store, logger }: DeleteBookDeps): RequestHandler =>
    async (req: ValidatedRequest<{ params: { id: string } }>, res: Response): Promise<void> => {
        const { id } = requireValidated(req).params;
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
