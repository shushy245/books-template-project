import { Shelf } from '@reading-room/common';

import { ShelfRepositoryPort } from '../ports/shelf-repository.port.ts';

type ListShelvesDeps = {
    shelfRepo: ShelfRepositoryPort;
};

export const listShelves = ({ shelfRepo }: ListShelvesDeps): Promise<Shelf[]> => shelfRepo.list();
