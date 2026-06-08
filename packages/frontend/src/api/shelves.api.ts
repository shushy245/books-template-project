import { Shelf } from '@reading-room/common';

import { httpClient } from './http-client.js';

export const fetchShelves = async (): Promise<Shelf[]> => {
    const response = await httpClient.get<Shelf[]>('/shelves');

    return response.data;
};
