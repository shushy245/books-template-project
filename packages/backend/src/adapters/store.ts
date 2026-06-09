import { Db } from '../db/client.ts';
import { StorePort, TransactionRepos } from '../domain/ports/store.port.ts';
import { BookRepository } from './repositories/book.repository.ts';
import { AuthorRepository } from './repositories/author.repository.ts';
import { OutboxRepository } from './outbox/outbox.repository.ts';
import { ShelfRepository } from './repositories/shelf.repository.ts';
import { DeadLetterStore } from './outbox/dead-letter-store.ts';

export class Store implements StorePort {
    readonly books: BookRepository;
    readonly authors: AuthorRepository;
    readonly shelves: ShelfRepository;
    readonly outbox: OutboxRepository;
    readonly deadLetters: DeadLetterStore;

    constructor(private readonly db: Db) {
        this.books = new BookRepository(db);
        this.authors = new AuthorRepository(db);
        this.shelves = new ShelfRepository(db);
        this.outbox = new OutboxRepository(db);
        this.deadLetters = new DeadLetterStore(db);
    }

    async transaction<T>(work: (repos: TransactionRepos) => Promise<T>): Promise<T> {
        return this.db.transaction(async (tx) =>
            work({
                books: new BookRepository(tx),
                outbox: new OutboxRepository(tx),
                deadLetters: new DeadLetterStore(tx),
            }),
        );
    }
}
