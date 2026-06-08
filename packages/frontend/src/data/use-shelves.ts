import { useEffect, useState } from 'react';

import { Shelf } from '@reading-room/common';

import { fetchShelves } from '../api/shelves.api.js';

type UseShelvesResult = {
    data: Shelf[] | undefined;
    loading: boolean;
    error: Error | undefined;
};

export const useShelves = (): UseShelvesResult => {
    const [data, setData] = useState<Shelf[] | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        setLoading(true);
        setError(undefined);

        fetchShelves()
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err : new Error('fetchShelves: unexpected error'));
                setLoading(false);
            });
    }, []);

    return { data, loading, error };
};
