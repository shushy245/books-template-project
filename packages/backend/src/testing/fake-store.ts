import { StorePort, TransactionRepos } from '../domain/ports/store.port.js';

import { FakeBookRepository } from './fake-book-repository.js';
import { FakeAuthorRepository } from './fake-author.repository.js';
import { FakeOutboxRepository } from './fake-outbox.repository.js';
import { FakeShelfRepository } from './fake-shelf.repository.js';
import { FakeDeadLetterStore } from './fake-dead-letter-store.js';

export class FakeStore implements StorePort {
    readonly books = new FakeBookRepository();
    readonly authors = new FakeAuthorRepository();
    readonly shelves = new FakeShelfRepository();
    readonly outbox = new FakeOutboxRepository();
    readonly deadLetters = new FakeDeadLetterStore();

    async transaction<T>(work: (repos: TransactionRepos) => Promise<T>): Promise<T> {
        return work({ books: this.books, outbox: this.outbox, deadLetters: this.deadLetters });
    }
}
