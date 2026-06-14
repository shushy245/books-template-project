import { useCallback, useEffect, useRef, useState } from 'react';

import { useIsMounted } from './use-is-mounted.ts';

type RestfulState<T> = {
    data: T | undefined;
    loading: boolean;
    error: Error | undefined;
};

// opts.args is always required (no void case — for no-args fetches use useFetchOnMount)
export type RestfulRefresh<A> = (opts: { silent?: boolean; args: A }) => Promise<void>;

export type UseRestfulWrapperArgs<T, A> = {
    fetch: (args: A) => Promise<T>;
    initialArgs: A;
};

export type RestfulChildProps<T, A> = {
    data: T;
    loading: boolean;
    refresh: RestfulRefresh<A>;
};

export type RestfulErrorProps<A> = {
    error: Error;
    loading: boolean;
    refresh: RestfulRefresh<A>;
};

type RenderRestfulStateProps<T, A> = {
    renderChild: (props: RestfulChildProps<T, A>) => JSX.Element;
    renderError?: (props: RestfulErrorProps<A>) => JSX.Element;
    renderLoader?: () => JSX.Element;
};

export const useRestfulWrapper = <T, A>(
    options: UseRestfulWrapperArgs<T, A>,
): {
    data: T | undefined;
    loading: boolean;
    error: Error | undefined;
    refresh: RestfulRefresh<A>;
    renderRestfulState: (props: RenderRestfulStateProps<T, A>) => JSX.Element;
} => {
    const isMounted = useIsMounted();
    const optionsRef = useRef(options);
    optionsRef.current = options;
    const generationRef = useRef(0);

    const [state, setState] = useState<RestfulState<T>>({
        data: undefined,
        loading: true,
        error: undefined,
    });

    // Wraps any fetch call to a zero-arg thunk so A does not leak into state management.
    // generationRef guards against last-to-resolve wins: only the most recent call applies state.
    const runFetch = useCallback((fetchFn: () => Promise<T>, silent: boolean): Promise<void> => {
        const generation = ++generationRef.current;

        if (!silent) {
            setState((prev) => ({ ...prev, loading: true, error: undefined }));
        }

        return fetchFn()
            .then((data) => {
                if (!isMounted() || generationRef.current !== generation) return;
                setState((prev) => ({ ...prev, data, loading: false, error: undefined }));
            })
            .catch((err: unknown) => {
                if (!isMounted() || generationRef.current !== generation) return;
                setState((prev) => ({
                    ...prev,
                    error: err instanceof Error ? err : new Error(String(err)),
                    loading: false,
                }));
            });
    }, []);

    useEffect(() => {
        runFetch(() => optionsRef.current.fetch(optionsRef.current.initialArgs), false).catch(() => {});
    }, []);

    const refresh: RestfulRefresh<A> = ({ silent = false, args }) =>
        runFetch(() => optionsRef.current.fetch(args), silent);

    const renderRestfulState = (props: RenderRestfulStateProps<T, A>): JSX.Element => {
        const { renderChild, renderError, renderLoader } = props;
        const { data, loading, error } = state;

        if (error !== undefined) {
            if (renderError !== undefined) {
                return renderError({ error, loading, refresh });
            }
            throw error;
        }

        if (data !== undefined) {
            return renderChild({ data, loading, refresh });
        }

        if (renderLoader !== undefined) {
            return renderLoader();
        }

        return <p>{`Loading…`}</p>;
    };

    return {
        data: state.data,
        loading: state.loading,
        error: state.error,
        refresh,
        renderRestfulState,
    };
};
