import { ReadingStatus } from '@reading-room/common';
import { describe, expect, it } from 'vitest';

import { canRate, canTransition } from './book-rules.ts';

describe('canTransition', () => {
    it('a want-to-read book can move to reading', () => {
        expect(canTransition(ReadingStatus.WantToRead, ReadingStatus.Reading)).toBe(true);
    });

    it('a want-to-read book can be abandoned', () => {
        expect(canTransition(ReadingStatus.WantToRead, ReadingStatus.Abandoned)).toBe(true);
    });

    it('a reading book can be marked as read', () => {
        expect(canTransition(ReadingStatus.Reading, ReadingStatus.Read)).toBe(true);
    });

    it('a reading book can be abandoned', () => {
        expect(canTransition(ReadingStatus.Reading, ReadingStatus.Abandoned)).toBe(true);
    });

    it('a read book can be abandoned', () => {
        expect(canTransition(ReadingStatus.Read, ReadingStatus.Abandoned)).toBe(true);
    });

    it('an abandoned book can be moved back to want-to-read', () => {
        expect(canTransition(ReadingStatus.Abandoned, ReadingStatus.WantToRead)).toBe(true);
    });

    it('a read book cannot move back to reading', () => {
        expect(canTransition(ReadingStatus.Read, ReadingStatus.Reading)).toBe(false);
    });

    it('a want-to-read book cannot jump straight to read', () => {
        expect(canTransition(ReadingStatus.WantToRead, ReadingStatus.Read)).toBe(false);
    });

    it('a reading book cannot move back to want-to-read', () => {
        expect(canTransition(ReadingStatus.Reading, ReadingStatus.WantToRead)).toBe(false);
    });
});

describe('canRate', () => {
    it('only a read book can be rated', () => {
        expect(canRate(ReadingStatus.Read)).toBe(true);
    });

    it('a want-to-read book cannot be rated', () => {
        expect(canRate(ReadingStatus.WantToRead)).toBe(false);
    });

    it('a book being read cannot be rated', () => {
        expect(canRate(ReadingStatus.Reading)).toBe(false);
    });

    it('an abandoned book cannot be rated', () => {
        expect(canRate(ReadingStatus.Abandoned)).toBe(false);
    });
});
