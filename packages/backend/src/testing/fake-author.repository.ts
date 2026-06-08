import { Author } from '@reading-room/common';

import { AuthorRepositoryPort } from '../domain/ports/author-repository.port.js';

export class FakeAuthorRepository implements AuthorRepositoryPort {
    private readonly store: Map<string, Author> = new Map();

    seed(author: Author): void {
        this.store.set(author.id, author);
    }

    async findById(id: string): Promise<Author | undefined> {
        return this.store.get(id);
    }

    async list(): Promise<Author[]> {
        // Mirror the real AuthorRepository, which orders by name ascending.
        return [...this.store.values()].sort((a, b) => a.name.localeCompare(b.name));
    }
}
