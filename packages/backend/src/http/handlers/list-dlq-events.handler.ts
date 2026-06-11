import { RequestHandler, Response } from 'express';

import { LoggerPort } from '../../telemetry/logger.port.ts';
import { StorePort } from '../../domain/ports/store.port.ts';
import { listDlqEvents } from '../../domain/queries/list-dlq-events.ts';

type ListDlqEventsDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const makeListDlqEventsHandler =
    ({ store, logger }: ListDlqEventsDeps): RequestHandler =>
    async (_req, res: Response): Promise<void> => {
        logger.info({}, 'listDlqEvents: started');

        try {
            const events = await listDlqEvents({ deadLetters: store.deadLetters });
            res.json(events);
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message });

                return;
            }
            throw err;
        }
    };
