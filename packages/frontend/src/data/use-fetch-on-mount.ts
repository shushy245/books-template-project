import { useEffect, useState } from 'react';

import { useIsMounted } from './use-is-mounted.ts';

type FetchOnMountState<T> = {
    data: T | undefined;
    loading: boolean;
    error: Error | undefined;
};

export const useFetchOnMount = <T>(fetcher: () => Promise<T>): FetchOnMountState<T> => {
    const isMounted = useIsMounted();
    const [state, setState] = useState<FetchOnMountState<T>>({
        data: undefined,
        loading: true,
        error: undefined,
    });

    useEffect(() => {
        fetcher()
            .then((data) => {
                if (!isMounted()) return;
                setState({ data, loading: false, error: undefined });
            })
            .catch((err: unknown) => {
                if (!isMounted()) return;
                setState({
                    data: undefined,
                    loading: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                });
            });
    }, []);

    return state;
};
