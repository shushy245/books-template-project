import express, { Application, json } from 'express';

import { BookRepositoryPort } from './domain/ports/book-repository.port.js';
import { buildRouter } from './http/router.js';
import { Logger } from './telemetry/logger.port.js';

export type AppDeps = {
    bookRepo: BookRepositoryPort;
    logger: Logger;
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
