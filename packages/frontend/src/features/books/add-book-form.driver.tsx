import { vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { Author, ReadingStatus, Shelf } from '@reading-room/common';

import { AddBookForm } from './add-book-form.tsx';
import * as booksApi from '../../api/books.api.ts';
import { BookListProvider } from './book-list-context.tsx';
import * as useAuthorsModule from '../../data/use-authors.ts';
import * as useShelvesModule from '../../data/use-shelves.ts';
import { AddBookFormTestIds } from './add-book-form.test-ids.ts';

export type AddBookFormDriver = {
    given: {
        authors: (authors: Author[]) => void;
        shelves: (shelves: Shelf[]) => void;
        createBookResolves: () => void;
        createBookRejectsWith: (err?: Error) => void;
        createBookNeverResolves: () => void;
    };
    when: {
        created: () => Promise<void>;
    };
    type: {
        title: (value: string) => Promise<void>;
    };
    select: {
        author: (id: string) => Promise<void>;
        shelf: (id: string) => Promise<void>;
    };
    click: {
        submit: () => Promise<void>;
    };
    assert: {
        submitDisabled: () => void;
        submitEnabled: () => void;
        errorVisible: () => Promise<void>;
        errorAbsent: () => void;
        formResetEventually: () => Promise<void>;
    };
};

export const makeAddBookFormDriver = (): AddBookFormDriver => {
    const user = userEvent.setup();

    return {
        given: {
            authors: (authors) => {
                vi.mocked(useAuthorsModule.useAuthors).mockReturnValue({
                    data: authors,
                    loading: false,
                    error: undefined,
                });
            },
            shelves: (shelves) => {
                vi.mocked(useShelvesModule.useShelves).mockReturnValue({
                    data: shelves,
                    loading: false,
                    error: undefined,
                });
            },
            createBookResolves: () => {
                vi.mocked(booksApi.createBook).mockResolvedValue({
                    id: 'book-new',
                    title: 'New Book',
                    authorId: 'author-1',
                    shelfId: 'shelf-1',
                    status: ReadingStatus.WantToRead,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            },
            createBookRejectsWith: (err = new Error('network error')) => {
                vi.mocked(booksApi.createBook).mockRejectedValue(err);
            },
            createBookNeverResolves: () => {
                vi.mocked(booksApi.createBook).mockImplementation(() => new Promise(() => {}));
            },
        },
        when: {
            created: async () => {
                render(
                    <BookListProvider>
                        <AddBookForm />
                    </BookListProvider>,
                );
            },
        },
        type: {
            title: async (value) => {
                await user.type(screen.getByTestId(AddBookFormTestIds.TitleInput), value);
            },
        },
        select: {
            author: async (id) => {
                await user.selectOptions(screen.getByTestId(AddBookFormTestIds.AuthorSelect), id);
            },
            shelf: async (id) => {
                await user.selectOptions(screen.getByTestId(AddBookFormTestIds.ShelfSelect), id);
            },
        },
        click: {
            submit: async () => {
                await user.click(screen.getByTestId(AddBookFormTestIds.SubmitButton));
            },
        },
        assert: {
            submitDisabled: () => {
                expect(screen.getByTestId(AddBookFormTestIds.SubmitButton)).toBeDisabled();
            },
            submitEnabled: () => {
                expect(screen.getByTestId(AddBookFormTestIds.SubmitButton)).not.toBeDisabled();
            },
            errorVisible: async () => {
                await waitFor(() => {
                    expect(screen.getByTestId(AddBookFormTestIds.Error)).toBeInTheDocument();
                });
            },
            errorAbsent: () => {
                expect(screen.queryByTestId(AddBookFormTestIds.Error)).not.toBeInTheDocument();
            },
            formResetEventually: async () => {
                await waitFor(() => {
                    const titleInput = screen.getByTestId(AddBookFormTestIds.TitleInput);
                    if (!(titleInput instanceof HTMLInputElement))
                        throw new Error('add-book-form driver: expected input at TitleInput');
                    expect(titleInput.value).toBe('');

                    const authorSelect = screen.getByTestId(AddBookFormTestIds.AuthorSelect);
                    if (!(authorSelect instanceof HTMLSelectElement))
                        throw new Error('add-book-form driver: expected select at AuthorSelect');
                    expect(authorSelect.value).toBe('');

                    const shelfSelect = screen.getByTestId(AddBookFormTestIds.ShelfSelect);
                    if (!(shelfSelect instanceof HTMLSelectElement))
                        throw new Error('add-book-form driver: expected select at ShelfSelect');
                    expect(shelfSelect.value).toBe('');
                });
            },
        },
    };
};
