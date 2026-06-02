import { describe, expect, it } from 'vitest';

import { add } from './add';

describe('tooling', () => {
    it('vitest is wired correctly', () => {
        expect(add(2, 3)).toBe(5);
    });
});
