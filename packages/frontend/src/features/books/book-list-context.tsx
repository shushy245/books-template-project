import { ReactNode, createContext, useContext, useState } from 'react';

import { BookQueryDto, BookSortField, SortDirection } from '@reading-room/common';

type BookListContextValue = {
    query: BookQueryDto;
    setSortBy: (sortBy: BookSortField) => void;
    setSortDir: (sortDir: SortDirection) => void;
    setPage: (page: number) => void;
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
    const [sortBy, setSortBy] = useState<BookSortField>(BookSortField.CreatedAt);
    const [sortDir, setSortDir] = useState<SortDirection>(SortDirection.Desc);
    const [page, setPage] = useState(1);

    const query: BookQueryDto = { sortBy, sortDir, page, pageSize: 20 };

    return (
        <BookListContext.Provider value={{ query, setSortBy, setSortDir, setPage }}>
            {children}
        </BookListContext.Provider>
    );
};
