import { Shelf } from '@reading-room/common';

import { fetchShelves } from '../api/shelves.api.ts';
import { useFetchOnMount } from './use-fetch-on-mount.ts';

type UseShelvesResult = {
    data: Shelf[] | undefined;
    loading: boolean;
    error: Error | undefined;
};

export const useShelves = (): UseShelvesResult => useFetchOnMount(fetchShelves);
