import { Shelf } from '@reading-room/common';

import { ShelfRepositoryPort } from '../domain/ports/shelf-repository.port.js';

export class FakeShelfRepository implements ShelfRepositoryPort {
    private readonly store: Map<string, Shelf> = new Map();

    seed(shelf: Shelf): void {
        this.store.set(shelf.id, shelf);
    }

    async findById(id: string): Promise<Shelf | undefined> {
        return this.store.get(id);
    }
}
