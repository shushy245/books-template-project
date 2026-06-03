import type { Response } from 'supertest';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from './app.js';
import { FakeStore } from './testing/fake-store.js';
import { makeFakeLogger } from './testing/fake-logger.js';

type HealthDriver = {
    get: {
        health: () => Promise<Response>;
    };
    assert: {
        healthOk: (response: Response) => void;
        healthLogged: () => void;
    };
};

const makeHealthDriver = (): HealthDriver => {
    const logger = makeFakeLogger();
    const app = buildApp({ store: new FakeStore(), logger });

    return {
        get: {
            health: () => request(app).get('/health'),
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

describe('GET /health', () => {
    let driver: HealthDriver;

    beforeEach(() => {
        driver = makeHealthDriver();
    });

    it('returns 200 with status ok', async () => {
        const response = await driver.get.health();

        driver.assert.healthOk(response);
    });

    it('logs a handler-entry message', async () => {
        await driver.get.health();

        driver.assert.healthLogged();
    });
});
