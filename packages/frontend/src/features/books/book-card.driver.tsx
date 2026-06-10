import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';

import { Book, ReadingStatus } from '@reading-room/common';

import * as booksApi from '../../api/books.api.ts';
import { aBook } from '../../testing/builders/index.ts';
import { BookCard } from './book-card.tsx';
import { BookListTestIds } from './book-list.test-ids.ts';
import { readingStatusLabelMap } from './book-list.utils.ts';

export type BookCardDriver = {
    given: {
        book: (overrides?: Partial<Book>) => void;
        patchBookResolvesWith: (overrides?: Partial<Book>) => void;
        patchBookRejectsWith: (error?: Error) => void;
    };
    when: {
        created: () => Promise<void>;
    };
    click: {
        delete: () => Promise<void>;
    };
    select: {
        status: (status: ReadingStatus) => Promise<void>;
    };
    assert: {
        title: (title: string) => void;
        rating: (rating: number) => void;
        status: (status: ReadingStatus) => void;
        statusEventually: (status: ReadingStatus) => Promise<void>;
        onDeleteCalledWith: (id: string) => void;
    };
};

export const makeBookCardDriver = (): BookCardDriver => {
    const user = userEvent.setup();
    let _book = aBook().build();
    const _onDelete = vi.fn();

    return {
        given: {
            book: (overrides = {}) => {
                _book = aBook(overrides).build();
            },
            patchBookResolvesWith: (overrides = {}) => {
                vi.spyOn(booksApi, 'patchBook').mockImplementation(() =>
                    Promise.resolve({ ..._book, updatedAt: new Date(), ...overrides }),
                );
            },
            patchBookRejectsWith: (error = new Error('network error')) => {
                vi.spyOn(booksApi, 'patchBook').mockRejectedValue(error);
            },
        },
        when: {
            created: async () => {
                render(<BookCard book={_book} onDelete={_onDelete} />);
            },
        },
        click: {
            delete: async () => {
                await user.click(screen.getByTestId(BookListTestIds.CardDeleteButton(_book.id)));
            },
        },
        select: {
            status: async (status) => {
                await user.selectOptions(
                    screen.getByTestId(BookListTestIds.CardStatus(_book.id)),
                    readingStatusLabelMap[status],
                );
            },
        },
        assert: {
            title: (title) => {
                expect(screen.getByText(title)).toBeInTheDocument();
            },
            rating: (rating) => {
                expect(screen.getByText(`${rating} ★`)).toBeInTheDocument();
            },
            status: (status) => {
                const el = screen.getByTestId(BookListTestIds.CardStatus(_book.id));
                if (!(el instanceof HTMLSelectElement))
                    throw new Error(`book-card driver: expected select at ${_book.id}`);
                expect(el.value).toBe(status);
            },
            statusEventually: async (status) => {
                await waitFor(() => {
                    const el = screen.getByTestId(BookListTestIds.CardStatus(_book.id));
                    if (!(el instanceof HTMLSelectElement))
                        throw new Error(`book-card driver: expected select at ${_book.id}`);
                    expect(el.value).toBe(status);
                });
            },
            onDeleteCalledWith: (id) => {
                expect(_onDelete).toHaveBeenCalledWith(id);
            },
        },
    };
};
