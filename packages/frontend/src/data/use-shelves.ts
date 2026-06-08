import { Shelf } from '@reading-room/common';

import { fetchShelves } from '../api/shelves.api.js';
import { useFetchOnMount } from './use-fetch-on-mount.js';

type UseShelvesResult = {
    data: Shelf[] | undefined;
    loading: boolean;
    error: Error | undefined;
};

export const useShelves = (): UseShelvesResult => useFetchOnMount(fetchShelves, 'fetchShelves: unexpected error');
