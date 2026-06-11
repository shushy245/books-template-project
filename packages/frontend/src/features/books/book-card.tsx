import { useState } from 'react';
import { Book, ReadingStatus } from '@reading-room/common';

import { Column, Row } from '../../ui/box.tsx';
import { patchBook } from '../../api/books.api.ts';
import { BookListTestIds } from './book-list.test-ids.ts';
import { isReadingStatus, readingStatusLabelMap } from './book-list.utils.ts';

import styles from './book-card.module.scss';

type BookCardProps = { book: Book; onDelete: (id: string) => void };

export const BookCard = ({ book, onDelete }: BookCardProps): JSX.Element => {
    const [localBook, setLocalBook] = useState(book);

    const handleDelete = (): void => {
        onDelete(localBook.id);
    };

    const handleStatusChange = async (newStatus: ReadingStatus): Promise<void> => {
        const original = localBook;
        setLocalBook({ ...localBook, status: newStatus });

        try {
            const updated = await patchBook({
                id: localBook.id,
                updatedAt: String(localBook.updatedAt),
                status: newStatus,
            });
            setLocalBook(updated);
        } catch {
            setLocalBook(original);
        }
    };

    return (
        <Column className={styles.card} data-testid={BookListTestIds.Card(localBook.id)}>
            <h3 className={styles.title} data-testid={BookListTestIds.CardTitle(localBook.id)}>
                {localBook.title}
            </h3>

            <Row className={styles.meta}>
                <StatusSelect book={localBook} onStatusChange={handleStatusChange} />
                {localBook.rating !== undefined && <span>{`${localBook.rating} ★`}</span>}
                <button
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    data-testid={BookListTestIds.CardDeleteButton(localBook.id)}
                >
                    {`Delete`}
                </button>
            </Row>
        </Column>
    );
};

type StatusSelectProps = {
    book: Book;
    onStatusChange: (status: ReadingStatus) => Promise<void>;
};

const StatusSelect = ({ book, onStatusChange }: StatusSelectProps): JSX.Element => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        if (isReadingStatus(e.target.value)) void onStatusChange(e.target.value);
    };

    return (
        <select
            value={book.status}
            onChange={handleChange}
            className={styles.status}
            data-testid={BookListTestIds.CardStatus(book.id)}
        >
            {Object.values(ReadingStatus).map((s) => (
                <option key={s} value={s}>
                    {readingStatusLabelMap[s]}
                </option>
            ))}
        </select>
    );
};
