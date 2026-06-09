import { Author } from '@reading-room/common';

import { httpClient } from './http-client.ts';

export const fetchAuthors = async (): Promise<Author[]> => {
    const response = await httpClient.get<Author[]>('/authors');

    return response.data;
};
