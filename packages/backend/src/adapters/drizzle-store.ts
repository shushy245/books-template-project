import { Db } from '../db/client.js';
import { StorePort, TransactionRepos } from '../domain/ports/store.port.js';
import { DrizzleBookRepository } from './repositories/drizzle-book.repository.js';
import { DrizzleOutboxRepository } from './outbox/drizzle-outbox.repository.js';
import { DrizzleShelfRepository } from './repositories/drizzle-shelf.repository.js';

export class DrizzleStore implements StorePort {
    readonly books: DrizzleBookRepository;
    readonly shelves: DrizzleShelfRepository;

    constructor(private readonly db: Db) {
        this.books = new DrizzleBookRepository(db);
        this.shelves = new DrizzleShelfRepository(db);
    }

    async transaction<T>(work: (repos: TransactionRepos) => Promise<T>): Promise<T> {
        return this.db.transaction(async (tx) =>
            work({
                books: new DrizzleBookRepository(tx),
                outbox: new DrizzleOutboxRepository(tx),
            }),
        );
    }
}
