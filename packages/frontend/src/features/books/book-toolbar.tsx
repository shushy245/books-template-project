import { BookSortField, SortDirection } from '@reading-room/common';

import { Row } from '../../ui/box.tsx';
import { BookListTestIds } from './book-list.test-ids.ts';
import { useBookListContext } from './book-list-context.tsx';
import { isBookSortField, isSortDirection, sortDirectionLabelMap, sortFieldLabelMap } from './book-list.utils.ts';

import styles from './book-list.module.scss';

export const BookToolbar = (): JSX.Element => {
    const { query, setSortBy, setSortDir } = useBookListContext();

    const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        if (isBookSortField(e.target.value)) setSortBy(e.target.value);
    };

    const handleSortDirChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        if (isSortDirection(e.target.value)) setSortDir(e.target.value);
    };

    return (
        <Row className={styles.toolbar} data-testid={BookListTestIds.Toolbar}>
            <label>
                Sort by
                <select value={query.sortBy} onChange={handleSortByChange} data-testid={BookListTestIds.SortBySelect}>
                    {Object.values(BookSortField).map((field) => (
                        <option key={field} value={field}>
                            {sortFieldLabelMap[field]}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Direction
                <select
                    value={query.sortDir}
                    onChange={handleSortDirChange}
                    data-testid={BookListTestIds.SortDirSelect}
                >
                    {Object.values(SortDirection).map((dir) => (
                        <option key={dir} value={dir}>
                            {sortDirectionLabelMap[dir]}
                        </option>
                    ))}
                </select>
            </label>
        </Row>
    );
};
