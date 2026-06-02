import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import express, { json } from 'express';
import type { Response } from 'supertest';
import supertest from 'supertest';

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

type ValidateDriver = {
    post: (body: Record<string, unknown>) => Promise<Response>;
    assertSuccess: (res: Response, expected: Record<string, unknown>) => void;
    assertBadRequest: (res: Response) => void;
    assertFieldAbsent: (res: Response, field: string) => void;
};

const makeValidateDriver = (): ValidateDriver => ({
    post: (body) => supertest(app).post('/test').send(body),

    assertSuccess: (res, expected) => {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(expected);
    },

    assertBadRequest: (res) => {
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    },

    assertFieldAbsent: (res, field) => {
        expect(res.body[field]).toBeUndefined();
    },
});

describe('validateBody', () => {
    const driver = makeValidateDriver();

    it('returns 200 with parsed body on valid input', async () => {
        const res = await driver.post({ name: 'Alice', age: 30 });

        driver.assertSuccess(res, { name: 'Alice', age: 30 });
    });

    it('returns 400 on invalid input', async () => {
        const res = await driver.post({ name: '', age: 'not-a-number' });

        driver.assertBadRequest(res);
    });

    it('strips unknown fields from the parsed body', async () => {
        const res = await driver.post({ name: 'Bob', age: 25, extra: 'stripped' });

        driver.assertSuccess(res, { name: 'Bob', age: 25 });
        driver.assertFieldAbsent(res, 'extra');
    });

    it('returns 400 on missing required fields', async () => {
        const res = await driver.post({ name: 'Alice' });

        driver.assertBadRequest(res);
    });
});
