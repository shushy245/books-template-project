import { expect } from 'vitest';
import { parseBookQuery } from './list-books.handler.utils.js';

export type ParseBookQueryDriver = {
    assert: {
        parsed: (raw: Record<string, unknown>, expected: ReturnType<typeof parseBookQuery>) => void;
        rejects: (raw: Record<string, unknown>) => void;
    };
};

export const makeParseBookQueryDriver = (): ParseBookQueryDriver => ({
    assert: {
        parsed: (raw, expected) => {
            expect(parseBookQuery(raw)).toEqual(expected);
        },

        rejects: (raw) => {
            expect(() => parseBookQuery(raw)).toThrow();
        },
    },
});
