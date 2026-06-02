import express, { Application, json } from 'express';

import { StorePort } from './domain/ports/store.port.js';
import { buildRouter } from './http/router.js';
import { LoggerPort } from './telemetry/logger.port.js';

export type AppDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const buildApp = (deps: AppDeps): Application => {
    const app = express();
    app.use(json());

    app.get('/health', (req, res) => {
        deps.logger.info({}, 'health: started');
        res.json({ status: 'ok' });
    });

    app.use('/api', buildRouter(deps));

    return app;
};
