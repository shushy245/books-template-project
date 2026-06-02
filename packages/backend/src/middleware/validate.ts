import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodSchema } from 'zod';

export type ValidatedRequest<T> = Request & { body: T };

export const validateBody = <T>(schema: ZodSchema<T>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ error: result.error.issues.map(i => i.message).join(', ') });
      return;
    }

    req.body = result.data;
    next();
  };
