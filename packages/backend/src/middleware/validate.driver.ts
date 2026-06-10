import { z } from 'zod';
import { expect } from 'vitest';
import supertest from 'supertest';
import express, { json } from 'express';
import type { Response } from 'supertest';

import { validateBody } from './validate.ts';

const Schema = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
});

const app = express();
app.use(json());
app.post('/test', validateBody(Schema), (req, res) => {
    res.status(200).json(req.body);
});

export type ValidateDriver = {
    post: {
        body: (body: Record<string, unknown>) => Promise<Response>;
    };
    assert: {
        success: (res: Response, expected: Record<string, unknown>) => void;
        badRequest: (res: Response) => void;
        fieldAbsent: (res: Response, field: string) => void;
    };
};

export const makeValidateDriver = (): ValidateDriver => ({
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
