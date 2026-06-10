import { expect } from 'vitest';

import { parseUpdateBookBody, parseUpdateBookParams } from './update-book.handler.utils.ts';

export type ParseUpdateBookDriver = {
    assert: {
        bodyParsed: (raw: Record<string, unknown>, expected: Record<string, unknown>) => void;
        paramsParsed: (raw: Record<string, unknown>, expected: { id: string }) => void;
        bodyRejects: (raw: Record<string, unknown>) => void;
        paramsReject: (raw: Record<string, unknown>) => void;
    };
};

export const makeParseUpdateBookDriver = (): ParseUpdateBookDriver => ({
    assert: {
        bodyParsed: (raw, expected) => {
            const result = parseUpdateBookBody(raw);
            expect(result).toMatchObject(expected);
            expect(result.updatedAt).toBeInstanceOf(Date);
        },

        paramsParsed: (raw, expected) => {
            expect(parseUpdateBookParams(raw)).toEqual(expected);
        },

        bodyRejects: (raw) => {
            expect(() => parseUpdateBookBody(raw)).toThrow();
        },

        paramsReject: (raw) => {
            expect(() => parseUpdateBookParams(raw)).toThrow();
        },
    },
});
