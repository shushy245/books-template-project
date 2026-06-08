import { Author } from '@reading-room/common';

import { fetchAuthors } from '../api/authors.api.js';
import { useFetchOnMount } from './use-fetch-on-mount.js';

type UseAuthorsResult = {
    data: Author[] | undefined;
    loading: boolean;
    error: Error | undefined;
};

export const useAuthors = (): UseAuthorsResult => useFetchOnMount(fetchAuthors, 'fetchAuthors: unexpected error');
