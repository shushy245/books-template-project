import { useState } from 'react';
import { PaginatedResult, Book } from '@reading-room/common';

import { BookCard } from './book-card.tsx';
import { Column, Row } from '../../ui/box.tsx';
import { deleteBook } from '../../api/books.api.ts';
import { BookListTestIds } from './book-list.test-ids.ts';
import { useBookListContext } from './book-list-context.tsx';

import styles from './book-list.module.scss';

export const BookList = (): JSX.Element => {
    const { data, error, query, setPage, refresh } = useBookListContext();
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

    const handleDelete = (id: string): void => {
        setHiddenIds((prev) => new Set([...prev, id]));
        deleteBook(id).catch(() => {
            setHiddenIds((prev) => {
                const next = new Set(prev);
                next.delete(id);

                return next;
            });
            refresh({ args: query }).catch(() => {});
        });
    };

    if (error !== undefined) return <p>{`Error: ${error.message}`}</p>;
    if (data === undefined) return <p>{`Loading…`}</p>;

    return (
        <BookListContent
            result={data}
            page={query.page ?? 1}
            onPageChange={setPage}
            hiddenIds={hiddenIds}
            onDelete={handleDelete}
        />
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
                {`No books yet.`}
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

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps): JSX.Element => {
    const handlePrevPage = (): void => {
        onPageChange(page - 1);
    };

    const handleNextPage = (): void => {
        onPageChange(page + 1);
    };

    return (
        <Row className={styles.pagination}>
            <button onClick={handlePrevPage} disabled={page <= 1} data-testid={BookListTestIds.PrevPage}>
                {`← Prev`}
            </button>
            <span>{`${page} / ${totalPages}`}</span>
            <button onClick={handleNextPage} disabled={page >= totalPages} data-testid={BookListTestIds.NextPage}>
                {`Next →`}
            </button>
        </Row>
    );
};
