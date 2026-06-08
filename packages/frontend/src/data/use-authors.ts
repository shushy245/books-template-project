import { useEffect, useState } from 'react';

import { Author } from '@reading-room/common';

import { fetchAuthors } from '../api/authors.api.js';

type UseAuthorsResult = {
    data: Author[] | undefined;
    loading: boolean;
    error: Error | undefined;
};

export const useAuthors = (): UseAuthorsResult => {
    const [data, setData] = useState<Author[] | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        setLoading(true);
        setError(undefined);

        fetchAuthors()
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err : new Error('fetchAuthors: unexpected error'));
                setLoading(false);
            });
    }, []);

    return { data, loading, error };
};
