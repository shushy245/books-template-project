import { RequestHandler, Response } from 'express';
import { UpdateBookDto } from '@reading-room/common';

import { errorToHttpStatus } from '../http-error.utils.ts';
import { LoggerPort } from '../../telemetry/logger.port.ts';
import { StorePort } from '../../domain/ports/store.port.ts';
import { updateBook } from '../../domain/commands/update-book.ts';
import { ValidatedRequest } from '../middleware/validate.middleware.ts';

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
