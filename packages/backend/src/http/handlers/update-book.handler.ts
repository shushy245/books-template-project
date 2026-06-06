import { RequestHandler, Response } from 'express';

import { UpdateBookDto } from '@reading-room/common';

import { StorePort } from '../../domain/ports/store.port.js';
import { updateBook } from '../../domain/commands/update-book.js';
import { LoggerPort } from '../../telemetry/logger.port.js';
import { errorToHttpStatus } from '../http-error.utils.js';
import { ValidatedRequest } from '../middleware/validate.middleware.js';

type UpdateBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeUpdateBookHandler =
    ({ store, logger }: UpdateBookDeps): RequestHandler =>
    async (
        req: ValidatedRequest<{ params: { id: string }; body: Omit<UpdateBookDto, 'id'> }>,
        res: Response,
    ): Promise<void> => {
        const { params, body } = req.validated!;
        logger.info({}, 'updateBook: handler started', { id: params.id });

        try {
            const book = await updateBook({ store, logger }, { id: params.id, ...body });
            res.json(book);
        } catch (err) {
            if (err instanceof Error) {
                res.status(errorToHttpStatus(err)).json({ error: err.message });
                return;
            }
            throw err;
        }
    };
