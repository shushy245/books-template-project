import { expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Book, ReadingStatus } from '@reading-room/common';

import { BookCard } from './book-card.tsx';
import { BookListTestIds } from './book-list.test-ids.ts';
import { readingStatusLabelMap } from './book-list.utils.ts';

const aBook = (overrides: Partial<Book> = {}): Book => ({
    id: 'book-1',
    title: 'Dune',
    authorId: 'author-1',
    shelfId: 'shelf-1',
    status: ReadingStatus.WantToRead,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
});

export type BookCardDriver = {
    given: {
        render: (overrides?: Partial<Book>) => { book: Book; onDelete: ReturnType<typeof vi.fn> };
    };
    click: {
        delete: (id: string) => Promise<void>;
    };
    select: {
        status: (id: string, status: ReadingStatus) => Promise<void>;
    };
    assert: {
        title: (title: string) => void;
        status: (id: string, status: ReadingStatus) => void;
        onDeleteCalledWith: (onDelete: ReturnType<typeof vi.fn>, id: string) => void;
    };
};

export const makeBookCardDriver = (): BookCardDriver => {
    const user = userEvent.setup();

    return {
        given: {
            render: (overrides = {}) => {
                const book = aBook(overrides);
                const onDelete = vi.fn();
                render(<BookCard book={book} onDelete={onDelete} />);

                return { book, onDelete };
            },
        },
        click: {
            delete: async (id) => {
                await user.click(screen.getByTestId(BookListTestIds.CardDeleteButton(id)));
            },
        },
        select: {
            status: async (id, status) => {
                await user.selectOptions(
                    screen.getByTestId(BookListTestIds.CardStatus(id)),
                    readingStatusLabelMap[status],
                );
            },
        },
        assert: {
            title: (title) => {
                expect(screen.getByText(title)).toBeTruthy();
            },
            status: (id, status) => {
                const select = screen.getByTestId(BookListTestIds.CardStatus(id)) as HTMLSelectElement;
                expect(select.value).toBe(status);
            },
            onDeleteCalledWith: (onDelete, id) => {
                expect(onDelete).toHaveBeenCalledWith(id);
            },
        },
    };
};
