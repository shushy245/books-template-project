import { expect } from 'vitest';
import { parseCreateBookBody } from './create-book.handler.utils.ts';

export type ParseCreateBookDriver = {
    assert: {
        bodyParsed: (raw: Record<string, unknown>, expected: Record<string, unknown>) => void;
        bodyRejects: (raw: Record<string, unknown>) => void;
    };
};

export const makeParseCreateBookDriver = (): ParseCreateBookDriver => ({
    assert: {
        bodyParsed: (raw, expected) => {
            expect(parseCreateBookBody(raw)).toEqual(expected);
        },

        bodyRejects: (raw) => {
            expect(() => parseCreateBookBody(raw)).toThrow();
        },
    },
});
