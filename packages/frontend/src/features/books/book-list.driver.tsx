import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';

import { Book, PaginatedResult } from '@reading-room/common';

import * as booksApi from '../../api/books.api.ts';
import { BookListProvider, useBookListContext } from './book-list-context.tsx';
import { BookList } from './book-list.tsx';
import { BookListTestIds } from './book-list.test-ids.ts';

const makePaginatedResult = (books: Book[], total?: number): PaginatedResult<Book> => ({
    items: books,
    total: total ?? books.length,
    page: 1,
    pageSize: 20,
});

const requireButton = (testId: string): HTMLButtonElement => {
    const el = screen.getByTestId(testId);
    if (!(el instanceof HTMLButtonElement)) throw new Error(`book-list driver: expected button at ${testId}`);

    return el;
};

const TriggerRefreshButton = (): JSX.Element => {
    const { triggerRefresh } = useBookListContext();

    return (
        <button data-testid="test:triggerRefresh" onClick={triggerRefresh}>
            {`Refresh`}
        </button>
    );
};

export type BookListDriver = {
    given: {
        books: (books: Book[], total?: number) => void;
        noBooks: () => void;
        deleteBookResolves: () => void;
    };
    when: {
        created: () => Promise<void>;
    };
    click: {
        nextPage: () => Promise<void>;
        prevPage: () => Promise<void>;
        triggerRefresh: () => Promise<void>;
    };
    assert: {
        cardCount: (count: number) => void;
        emptyState: () => void;
        prevDisabled: () => void;
        nextDisabled: () => void;
        nextEnabled: () => void;
        fetchCallCount: (count: number) => void;
        fetchCallCountEventually: (count: number) => Promise<void>;
    };
};

export const makeBookListDriver = (): BookListDriver => {
    const user = userEvent.setup();

    return {
        given: {
            books: (books, total) => {
                vi.mocked(booksApi.fetchBooks).mockResolvedValue(makePaginatedResult(books, total));
            },
            noBooks: () => {
                vi.mocked(booksApi.fetchBooks).mockResolvedValue(makePaginatedResult([]));
            },
            deleteBookResolves: () => {
                vi.mocked(booksApi.deleteBook).mockResolvedValue(undefined);
            },
        },
        when: {
            created: async () => {
                render(
                    <BookListProvider>
                        <BookList />
                        <TriggerRefreshButton />
                    </BookListProvider>,
                );
                await waitFor(() => {
                    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
                });
            },
        },
        click: {
            nextPage: async () => {
                await user.click(screen.getByTestId(BookListTestIds.NextPage));
            },
            prevPage: async () => {
                await user.click(screen.getByTestId(BookListTestIds.PrevPage));
            },
            triggerRefresh: async () => {
                await user.click(screen.getByTestId('test:triggerRefresh'));
            },
        },
        assert: {
            cardCount: (count) => {
                expect(screen.getAllByTestId(/^BookListTestIds\.Card\./)).toHaveLength(count);
            },
            emptyState: () => {
                expect(screen.getByTestId(BookListTestIds.EmptyState)).toBeInTheDocument();
            },
            prevDisabled: () => {
                expect(requireButton(BookListTestIds.PrevPage).disabled).toBe(true);
            },
            nextDisabled: () => {
                expect(requireButton(BookListTestIds.NextPage).disabled).toBe(true);
            },
            nextEnabled: () => {
                expect(requireButton(BookListTestIds.NextPage).disabled).toBe(false);
            },
            fetchCallCount: (count) => {
                expect(booksApi.fetchBooks).toHaveBeenCalledTimes(count);
            },
            fetchCallCountEventually: async (count) => {
                await waitFor(() => {
                    expect(booksApi.fetchBooks).toHaveBeenCalledTimes(count);
                });
            },
        },
    };
};
