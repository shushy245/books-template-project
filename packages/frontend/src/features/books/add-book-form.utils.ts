import { ReadingStatus } from '@reading-room/common';

export type AddBookFormState = {
    title: string;
    authorId: string;
    shelfId: string;
    status: ReadingStatus;
};

export const emptyAddBookForm = (): AddBookFormState => ({
    title: '',
    authorId: '',
    shelfId: '',
    status: ReadingStatus.WantToRead,
});

// The submit button is gated on this: a book needs a non-blank title and a chosen
// author and shelf. Status always has a value (defaults to WantToRead).
export const isAddBookFormValid = (state: AddBookFormState): boolean =>
    state.title.trim().length > 0 && state.authorId.length > 0 && state.shelfId.length > 0;

export const AddBookFormTestIds = {
    Form: 'AddBookFormTestIds.Form',
    TitleInput: 'AddBookFormTestIds.TitleInput',
    AuthorSelect: 'AddBookFormTestIds.AuthorSelect',
    ShelfSelect: 'AddBookFormTestIds.ShelfSelect',
    StatusSelect: 'AddBookFormTestIds.StatusSelect',
    SubmitButton: 'AddBookFormTestIds.SubmitButton',
    Error: 'AddBookFormTestIds.Error',
} as const;
