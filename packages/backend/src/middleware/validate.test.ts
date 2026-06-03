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
    post: {
        body: (body: Record<string, unknown>) => Promise<Response>;
    };
    assert: {
        success: (res: Response, expected: Record<string, unknown>) => void;
        badRequest: (res: Response) => void;
        fieldAbsent: (res: Response, field: string) => void;
    };
};

const makeValidateDriver = (): ValidateDriver => ({
    post: {
        body: (body) => supertest(app).post('/test').send(body),
    },

    assert: {
        success: (res, expected) => {
            expect(res.status).toBe(200);
            expect(res.body).toEqual(expected);
        },

        badRequest: (res) => {
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('error');
        },

        fieldAbsent: (res, field) => {
            expect(res.body[field]).toBeUndefined();
        },
    },
});

describe('validateBody', () => {
    const driver = makeValidateDriver();

    it('returns 200 with parsed body on valid input', async () => {
        const res = await driver.post.body({ name: 'Alice', age: 30 });

        driver.assert.success(res, { name: 'Alice', age: 30 });
    });

    it('returns 400 on invalid input', async () => {
        const res = await driver.post.body({ name: '', age: 'not-a-number' });

        driver.assert.badRequest(res);
    });

    it('strips unknown fields from the parsed body', async () => {
        const res = await driver.post.body({ name: 'Bob', age: 25, extra: 'stripped' });

        driver.assert.success(res, { name: 'Bob', age: 25 });
        driver.assert.fieldAbsent(res, 'extra');
    });

    it('returns 400 on missing required fields', async () => {
        const res = await driver.post.body({ name: 'Alice' });

        driver.assert.badRequest(res);
    });
});
