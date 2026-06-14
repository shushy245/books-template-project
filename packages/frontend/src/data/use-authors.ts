import { Author } from '@reading-room/common';

import { fetchAuthors } from '../api/authors.api.ts';
import { useFetchOnMount } from './use-fetch-on-mount.ts';

type UseAuthorsResult = {
    data: Author[] | undefined;
    loading: boolean;
    error: Error | undefined;
};

export const useAuthors = (): UseAuthorsResult => useFetchOnMount(fetchAuthors);
