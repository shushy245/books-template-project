import express, { Application, json } from 'express';

import { buildRouter } from './http/router.ts';
import { LoggerPort } from './telemetry/logger.port.ts';
import { StorePort } from './domain/ports/store.port.ts';

export type AppDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const buildApp = ({ store, logger }: AppDeps): Application => {
    const app = express();
    app.use(json());

    app.get('/api/health', (_req, res) => {
        logger.info({}, 'health: started');
        res.json({ status: 'ok' });
    });

    app.use('/api', buildRouter({ store, logger }));

    return app;
};
