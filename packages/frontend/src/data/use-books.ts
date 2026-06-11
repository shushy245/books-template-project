import { useCallback, useEffect, useState } from 'react';
import { Book, BookQueryDto, PaginatedResult } from '@reading-room/common';

import { fetchBooks } from '../api/books.api.ts';

type UseBooksResult = {
    data: PaginatedResult<Book> | undefined;
    loading: boolean;
    error: Error | undefined;
    refetch: () => void;
};

export const useBooks = (query: BookQueryDto): UseBooksResult => {
    const [data, setData] = useState<PaginatedResult<Book> | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [tick, setTick] = useState(0);

    const refetch = useCallback((): void => {
        setTick((t) => t + 1);
    }, []);

    const { page, pageSize, sortBy, sortDir, shelfId, status } = query;

    useEffect(() => {
        setLoading(true);
        setError(undefined);

        fetchBooks(query)
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err : new Error('fetchBooks: unexpected error'));
                setLoading(false);
            });
    }, [tick, page, pageSize, sortBy, sortDir, shelfId, status]);

    return { data, loading, error, refetch };
};
