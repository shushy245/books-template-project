import type { Response } from 'supertest';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from './app.js';
import { FakeStore } from './testing/fake-store.js';
import { makeFakeLogger } from './testing/fake-logger.js';

// HealthDriver: encapsulates all When actions and Then assertions for the health endpoint.
// Tests contain no logic or assertions — only driver calls.
type HealthDriver = {
    getHealth: () => Promise<Response>;
    assertHealthOk: (response: Response) => void;
    assertHealthLogged: () => void;
};

const makeHealthDriver = (): HealthDriver => {
    const logger = makeFakeLogger();
    const app = buildApp({ store: new FakeStore(), logger });

    return {
        getHealth: () => request(app).get('/health'),

        assertHealthOk: (response) => {
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'ok' });
        },

        assertHealthLogged: () => {
            const entry = logger.entries.find((e) => e.message.includes('health: started'));
            if (entry === undefined) {
                throw new Error('assertHealthLogged: expected a health: started log entry');
            }
            expect(entry.level).toBe('info');
        },
    };
};

describe('GET /health', () => {
    let driver: HealthDriver;

    beforeEach(() => {
        driver = makeHealthDriver();
    });

    it('returns 200 with status ok', async () => {
        const response = await driver.getHealth();
        driver.assertHealthOk(response);
    });

    it('logs a handler-entry message', async () => {
        await driver.getHealth();
        driver.assertHealthLogged();
    });
});
