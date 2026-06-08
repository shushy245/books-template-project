import { useEffect, useState } from 'react';

import { PaginatedResult, Book } from '@reading-room/common';

import { deleteBook } from '../../api/books.api.js';
import { Column, Row } from '../../ui/box.js';
import { RestfulWrapper } from '../../data/restful-wrapper.js';
import { useBooks } from '../../data/use-books.js';
import { useBookListContext } from './book-list-context.js';
import { BookCard } from './book-card.js';
import { BookListTestIds } from './book-list.test-ids.js';
import styles from './book-list.module.scss';

export const BookList = (): JSX.Element => {
    const { query, setPage, refreshToken } = useBookListContext();
    const { data, loading, error, refetch } = useBooks(query);
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

    // A sibling (the Add Book form) bumps refreshToken after creating a book; re-fetch the
    // server-sorted list so the new book appears. Skip the initial mount (token starts at 0).
    useEffect(() => {
        if (refreshToken === 0) return;

        refetch();
    }, [refreshToken, refetch]);

    const handleDelete = (id: string): void => {
        setHiddenIds((prev) => new Set([...prev, id]));
        deleteBook(id).catch(() => {
            setHiddenIds((prev) => {
                const next = new Set(prev);
                next.delete(id);

                return next;
            });
            refetch();
        });
    };

    return (
        <RestfulWrapper loading={loading} error={error} data={data}>
            {(result) => (
                <BookListContent
                    result={result}
                    page={query.page ?? 1}
                    onPageChange={setPage}
                    hiddenIds={hiddenIds}
                    onDelete={handleDelete}
                />
            )}
        </RestfulWrapper>
    );
};

type BookListContentProps = {
    result: PaginatedResult<Book>;
    page: number;
    onPageChange: (page: number) => void;
    hiddenIds: Set<string>;
    onDelete: (id: string) => void;
};

const BookListContent = ({ result, page, onPageChange, hiddenIds, onDelete }: BookListContentProps): JSX.Element => {
    const visibleItems = result.items.filter((b) => !hiddenIds.has(b.id));

    if (visibleItems.length === 0) {
        return (
            <p className={styles.empty} data-testid={BookListTestIds.EmptyState}>
                No books yet.
            </p>
        );
    }

    const totalPages = Math.ceil(result.total / result.pageSize);

    return (
        <Column>
            <Column className={styles.list} data-testid={BookListTestIds.List}>
                {visibleItems.map((book) => (
                    <BookCard key={book.id} book={book} onDelete={onDelete} />
                ))}
            </Column>

            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </Column>
    );
};

type PaginationProps = { page: number; totalPages: number; onPageChange: (page: number) => void };

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps): JSX.Element => (
    <Row className={styles.pagination}>
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} data-testid={BookListTestIds.PrevPage}>
            ← Prev
        </button>
        <span>
            {page} / {totalPages}
        </span>
        <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            data-testid={BookListTestIds.NextPage}
        >
            Next →
        </button>
    </Row>
);
