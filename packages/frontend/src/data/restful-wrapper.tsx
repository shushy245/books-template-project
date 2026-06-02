import { ReactNode } from 'react';

type RestfulWrapperProps<T> = {
    loading: boolean;
    error: Error | undefined;
    data: T | undefined;
    children: (data: T) => ReactNode;
};

export const RestfulWrapper = <T,>({ loading, error, data, children }: RestfulWrapperProps<T>): JSX.Element => {
    if (loading) return <p>Loading…</p>;
    if (error !== undefined) return <p>Error: {error.message}</p>;
    if (data === undefined) return <p>No data.</p>;
    return <>{children(data)}</>;
};
