import { StorePort, TransactionRepos } from '../domain/ports/store.port.js';

import { FakeBookRepository } from './fake-book-repository.js';
import { FakeOutboxRepository } from './fake-outbox.repository.js';
import { FakeShelfRepository } from './fake-shelf.repository.js';

export class FakeStore implements StorePort {
    readonly books = new FakeBookRepository();
    readonly shelves = new FakeShelfRepository();
    readonly outbox = new FakeOutboxRepository();

    async transaction<T>(work: (repos: TransactionRepos) => Promise<T>): Promise<T> {
        return work({ books: this.books, outbox: this.outbox });
    }
}
