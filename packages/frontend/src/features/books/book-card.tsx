import { Book } from '@reading-room/common';

import { Column, Row } from '../../ui/box.js';
import { BookListTestIds } from './book-list.test-ids.js';
import { readingStatusLabelMap } from './book-list.utils.js';
import styles from './book-card.module.scss';

type BookCardProps = { book: Book };

export const BookCard = ({ book }: BookCardProps): JSX.Element => (
    <Column className={styles.card} data-testid={BookListTestIds.Card(book.id)}>
        <h3 className={styles.title} data-testid={BookListTestIds.CardTitle(book.id)}>
            {book.title}
        </h3>

        <Row className={styles.meta}>
            <StatusBadge book={book} />
            {book.rating !== undefined && <span>{book.rating} ★</span>}
        </Row>
    </Column>
);

const StatusBadge = ({ book }: BookCardProps): JSX.Element => (
    <span className={styles.status} data-testid={BookListTestIds.CardStatus(book.id)}>
        {readingStatusLabelMap[book.status]}
    </span>
);
