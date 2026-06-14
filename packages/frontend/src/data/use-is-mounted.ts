import { useEffect, useRef } from 'react';

export const useIsMounted = (): (() => boolean) => {
    const mountedRef = useRef(true);
    useEffect(
        () => () => {
            mountedRef.current = false;
        },
        [],
    );

    return () => mountedRef.current;
};
