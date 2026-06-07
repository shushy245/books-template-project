import { expect } from 'vitest';
import type { Response } from 'supertest';
import request from 'supertest';

import { buildApp } from './app.js';
import { FakeStore } from './testing/fake-store.js';
import { makeFakeLogger } from './testing/fake-logger.js';

export type HealthDriver = {
    get: {
        health: () => Promise<Response>;
    };
    assert: {
        healthOk: (response: Response) => void;
        healthLogged: () => void;
    };
};

export const makeHealthDriver = (): HealthDriver => {
    const logger = makeFakeLogger();
    const app = buildApp({ store: new FakeStore(), logger });

    return {
        get: {
            health: () => request(app).get('/api/health'),
        },

        assert: {
            healthOk: (response) => {
                expect(response.status).toBe(200);
                expect(response.body).toEqual({ status: 'ok' });
            },

            healthLogged: () => {
                const entry = logger.entries.find((e) => e.message.includes('health: started'));
                if (entry === undefined) {
                    throw new Error('assertHealthLogged: expected a health: started log entry');
                }
                expect(entry.level).toBe('info');
            },
        },
    };
};
