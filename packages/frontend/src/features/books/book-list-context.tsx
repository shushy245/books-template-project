import { ReactNode, createContext, useContext, useState } from 'react';
import { Book, BookQueryDto, BookSortField, PaginatedResult, SortDirection } from '@reading-room/common';

import { fetchBooks } from '../../api/books.api.ts';
import { RestfulRefresh, useRestfulWrapper } from '../../data/use-restful-wrapper.tsx';

type BookListContextValue = {
    query: BookQueryDto;
    setSortBy: (sortBy: BookSortField) => void;
    setSortDir: (sortDir: SortDirection) => void;
    setPage: (page: number) => void;
    data: PaginatedResult<Book> | undefined;
    loading: boolean;
    error: Error | undefined;
    refresh: RestfulRefresh<BookQueryDto>;
};

const BookListContext = createContext<BookListContextValue | undefined>(undefined);

export const useBookListContext = (): BookListContextValue => {
    const ctx = useContext(BookListContext);
    if (ctx === undefined) {
        throw new Error('useBookListContext: must be used inside BookListProvider');
    }

    return ctx;
};

type BookListProviderProps = { children: ReactNode };

export const BookListProvider = ({ children }: BookListProviderProps): JSX.Element => {
    const [sortBy, setSortByState] = useState<BookSortField>(BookSortField.CreatedAt);
    const [sortDir, setSortDirState] = useState<SortDirection>(SortDirection.Desc);
    const [page, setPageState] = useState(1);

    const query: BookQueryDto = { sortBy, sortDir, page, pageSize: 20 };

    const { data, loading, error, refresh } = useRestfulWrapper<PaginatedResult<Book>, BookQueryDto>({
        fetch: fetchBooks,
        initialArgs: query,
    });

    const setSortBy = (sortBy: BookSortField): void => {
        setSortByState(sortBy);
        refresh({ args: { sortBy, sortDir, page, pageSize: 20 } }).catch(() => {});
    };

    const setSortDir = (sortDir: SortDirection): void => {
        setSortDirState(sortDir);
        refresh({ args: { sortBy, sortDir, page, pageSize: 20 } }).catch(() => {});
    };

    const setPage = (page: number): void => {
        setPageState(page);
        refresh({ args: { sortBy, sortDir, page, pageSize: 20 } }).catch(() => {});
    };

    return (
        <BookListContext.Provider value={{ query, setSortBy, setSortDir, setPage, data, loading, error, refresh }}>
            {children}
        </BookListContext.Provider>
    );
};
