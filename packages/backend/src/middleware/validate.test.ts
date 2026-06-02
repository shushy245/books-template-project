import express, { json } from 'express';
import supertest from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { validateBody } from './validate.js';

// Learning tests — verify Zod and the middleware behave as expected at our integration points.
// These exist to catch silent breakage on library upgrades.

const Schema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

const app = express();
app.use(json());
app.post('/test', validateBody(Schema), (req, res) => {
  res.status(200).json(req.body);
});

describe('validateBody', () => {
  it('returns 200 with parsed body on valid input', async () => {
    const res = await supertest(app).post('/test').send({ name: 'Alice', age: 30 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'Alice', age: 30 });
  });

  it('returns 400 on invalid input', async () => {
    const res = await supertest(app).post('/test').send({ name: '', age: 'not-a-number' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('strips unknown fields from the parsed body', async () => {
    const res = await supertest(app).post('/test').send({ name: 'Bob', age: 25, extra: 'stripped' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'Bob', age: 25 });
    expect(res.body.extra).toBeUndefined();
  });

  it('returns 400 on missing required fields', async () => {
    const res = await supertest(app).post('/test').send({ name: 'Alice' });

    expect(res.status).toBe(400);
  });
});
