import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { buildApp } from './app.js';
import { makeFakeLogger } from './testing/fake-logger.js';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const logger = makeFakeLogger();
    const app = buildApp({ logger });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('logs a handler-entry message', async () => {
    const logger = makeFakeLogger();
    const app = buildApp({ logger });

    await request(app).get('/health');

    const entryLog = logger.entries.find((e) => e.message.includes('health: started'));
    expect(entryLog).toBeDefined();
    expect(entryLog?.level).toBe('info');
  });
});
