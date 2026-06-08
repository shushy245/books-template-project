import { useEffect, useState } from 'react';

type UseFetchOnMountResult<T> = {
    data: T | undefined;
    loading: boolean;
    error: Error | undefined;
};

// Shared fetch-on-mount lifecycle: loading/error/data with Error normalisation.
// use-authors and use-shelves delegate here so the lifecycle lives in one place.
// (use-books is a richer variant — parameterised query + manual refetch — and stays separate.)
export const useFetchOnMount = <T>(fetcher: () => Promise<T>, errorLabel: string): UseFetchOnMountResult<T> => {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        setLoading(true);
        setError(undefined);

        fetcher()
            .then((result) => {
                setData(result);
                setLoading(false);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err : new Error(errorLabel));
                setLoading(false);
            });
        // Fetch once on mount — fetcher and errorLabel are stable module-level values.
    }, []);

    return { data, loading, error };
};
