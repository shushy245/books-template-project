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

    async list(): Promise<Shelf[]> {
        // Mirror the real ShelfRepository, which orders by name ascending.
        return [...this.store.values()].sort((a, b) => a.name.localeCompare(b.name));
    }
}
