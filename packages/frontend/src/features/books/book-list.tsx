import { PaginatedResult, Book } from '@reading-room/common';

import { Column, Row } from '../../ui/box.js';
import { RestfulWrapper } from '../../data/restful-wrapper.js';
import { useBooks } from '../../data/use-books.js';
import { useBookListContext } from './book-list-context.js';
import { BookCard } from './book-card.js';
import { BookListTestIds } from './book-list.test-ids.js';
import styles from './book-list.module.scss';

export const BookList = (): JSX.Element => {
    const { query, setPage } = useBookListContext();
    const { data, loading, error } = useBooks(query);

    return (
        <RestfulWrapper loading={loading} error={error} data={data}>
            {(result) => <BookListContent result={result} page={query.page ?? 1} onPageChange={setPage} />}
        </RestfulWrapper>
    );
};

type BookListContentProps = {
    result: PaginatedResult<Book>;
    page: number;
    onPageChange: (page: number) => void;
};

const BookListContent = ({ result, page, onPageChange }: BookListContentProps): JSX.Element => {
    if (result.items.length === 0) {
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
                {result.items.map((book) => (
                    <BookCard key={book.id} book={book} />
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
