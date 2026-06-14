import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useRestfulWrapper } from './use-restful-wrapper.tsx';

type Args = { page: number };
const initialArgs: Args = { page: 1 };

describe('useRestfulWrapper', () => {
    it('starts in loading state and calls fetch on mount with initialArgs', async () => {
        const fetchFn = vi.fn().mockResolvedValue(['item']);

        const { result } = renderHook(() => useRestfulWrapper<string[], Args>({ fetch: fetchFn, initialArgs }));

        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBeUndefined();
        expect(fetchFn).toHaveBeenCalledWith(initialArgs);

        await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('sets data and clears loading when fetch resolves', async () => {
        const fetchFn = vi.fn().mockResolvedValue(['item-a', 'item-b']);

        const { result } = renderHook(() => useRestfulWrapper<string[], Args>({ fetch: fetchFn, initialArgs }));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.data).toEqual(['item-a', 'item-b']);
        expect(result.current.error).toBeUndefined();
    });

    it('sets error and clears loading when fetch rejects', async () => {
        const fetchFn = vi.fn().mockRejectedValue(new Error('network error'));

        const { result } = renderHook(() => useRestfulWrapper<string[], Args>({ fetch: fetchFn, initialArgs }));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toEqual(new Error('network error'));
        expect(result.current.data).toBeUndefined();
    });

    it('normalises non-Error rejections to Error', async () => {
        const fetchFn = vi.fn().mockRejectedValue('plain string error');

        const { result } = renderHook(() => useRestfulWrapper<string[], Args>({ fetch: fetchFn, initialArgs }));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('plain string error');
    });

    it('refresh with args re-fetches using the given args', async () => {
        const fetchFn = vi.fn().mockResolvedValue([]);

        const { result } = renderHook(() => useRestfulWrapper<string[], Args>({ fetch: fetchFn, initialArgs }));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(fetchFn).toHaveBeenCalledWith(initialArgs);

        await act(async () => {
            await result.current.refresh({ args: { page: 2 } });
        });

        expect(fetchFn).toHaveBeenCalledWith({ page: 2 });
        expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('silent refresh keeps old data visible while re-fetching', async () => {
        const fetchFn = vi
            .fn()
            .mockResolvedValueOnce(['initial'])
            .mockImplementation(() => new Promise(() => {}));

        const { result } = renderHook(() => useRestfulWrapper<string[], Args>({ fetch: fetchFn, initialArgs }));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual(['initial']);

        act(() => {
            result.current.refresh({ silent: true, args: initialArgs });
        });

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual(['initial']);
    });

    it('does not crash when fetch resolves after unmount', async () => {
        let resolveRef: (val: string[]) => void = () => {};
        const { unmount } = renderHook(() =>
            useRestfulWrapper<string[], Args>({
                fetch: (_: Args) =>
                    new Promise<string[]>((res) => {
                        resolveRef = res;
                    }),
                initialArgs,
            }),
        );
        unmount();

        await act(async () => {
            resolveRef(['late data']);
        });
        // reaching here without throwing confirms the unmount guard worked
    });
});
