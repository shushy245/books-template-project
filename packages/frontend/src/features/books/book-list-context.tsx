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

const initialQuery: BookQueryDto = {
    sortBy: BookSortField.CreatedAt,
    sortDir: SortDirection.Desc,
    page: 1,
    pageSize: 20,
};

export const BookListProvider = ({ children }: BookListProviderProps): JSX.Element => {
    const [query, setQuery] = useState<BookQueryDto>(initialQuery);

    const { data, loading, error, refresh } = useRestfulWrapper<PaginatedResult<Book>, BookQueryDto>({
        fetch: fetchBooks,
        initialArgs: query,
    });

    const setSortBy = (sortBy: BookSortField): void => {
        const next = { ...query, sortBy, page: 1 };
        setQuery(next);
        refresh({ args: next }).catch(() => {});
    };

    const setSortDir = (sortDir: SortDirection): void => {
        const next = { ...query, sortDir, page: 1 };
        setQuery(next);
        refresh({ args: next }).catch(() => {});
    };

    const setPage = (page: number): void => {
        const next = { ...query, page };
        setQuery(next);
        refresh({ args: next }).catch(() => {});
    };

    return (
        <BookListContext.Provider value={{ query, setSortBy, setSortDir, setPage, data, loading, error, refresh }}>
            {children}
        </BookListContext.Provider>
    );
};
