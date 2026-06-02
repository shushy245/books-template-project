import express, { json, Application } from 'express';

import { Logger } from './telemetry/logger.port.js';

// AppDeps is the composition root's injection point.
// Every dependency the app needs arrives here — no imports from adapters in this file.
export type AppDeps = {
    logger: Logger;
};

export const buildApp = (deps: AppDeps): Application => {
    const app = express();
    app.use(json());

    // ── Routes ────────────────────────────────────────────────────────────────
    app.get('/health', (req, res) => {
        deps.logger.info({}, 'health: started');
        res.json({ status: 'ok' });
    });

    return app;
};
