import { Db } from '../db/client.js';
import { StorePort, TransactionRepos } from '../domain/ports/store.port.js';
import { BookRepository } from './repositories/book.repository.js';
import { OutboxRepository } from './outbox/outbox.repository.js';
import { ShelfRepository } from './repositories/shelf.repository.js';

export class Store implements StorePort {
    readonly books: BookRepository;
    readonly shelves: ShelfRepository;

    constructor(private readonly db: Db) {
        this.books = new BookRepository(db);
        this.shelves = new ShelfRepository(db);
    }

    async transaction<T>(work: (repos: TransactionRepos) => Promise<T>): Promise<T> {
        return this.db.transaction(async (tx) =>
            work({
                books: new BookRepository(tx),
                outbox: new OutboxRepository(tx),
            }),
        );
    }
}
