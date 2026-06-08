import { Shelf } from '@reading-room/common';

export interface ShelfRepositoryPort {
    findById(id: string): Promise<Shelf | undefined>;
    list(): Promise<Shelf[]>;
}
