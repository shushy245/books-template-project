import { StorePort, TransactionRepos } from '../domain/ports/store.port.ts';

import { FakeBookRepository } from './fake-book-repository.ts';
import { FakeAuthorRepository } from './fake-author.repository.ts';
import { FakeOutboxRepository } from './fake-outbox.repository.ts';
import { FakeShelfRepository } from './fake-shelf.repository.ts';
import { FakeDeadLetterStore } from './fake-dead-letter-store.ts';

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
