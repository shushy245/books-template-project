import { describe, expect, it } from 'vitest';
import { ReadingStatus } from '@reading-room/common';

import { AddBookFormState, emptyAddBookForm, isAddBookFormValid } from './add-book-form.utils.ts';

const aFormState = (overrides: Partial<AddBookFormState> = {}): AddBookFormState => ({
    title: 'Dune',
    authorId: 'author-1',
    shelfId: 'shelf-1',
    status: ReadingStatus.WantToRead,
    ...overrides,
});

describe('emptyAddBookForm', () => {
    it('starts blank with a WantToRead status', () => {
        expect(emptyAddBookForm()).toEqual({ title: '', authorId: '', shelfId: '', status: ReadingStatus.WantToRead });
    });
});

describe('isAddBookFormValid', () => {
    it('is valid when title, author and shelf are all set', () => {
        expect(isAddBookFormValid(aFormState())).toBe(true);
    });

    it('is invalid when the title is blank', () => {
        expect(isAddBookFormValid(aFormState({ title: '   ' }))).toBe(false);
    });

    it('is invalid when no author is chosen', () => {
        expect(isAddBookFormValid(aFormState({ authorId: '' }))).toBe(false);
    });

    it('is invalid when no shelf is chosen', () => {
        expect(isAddBookFormValid(aFormState({ shelfId: '' }))).toBe(false);
    });
});
