import { Db } from '../db/client.js';
import { TransactionalRepos, UnitOfWorkPort } from '../domain/ports/unit-of-work.port.js';
import { DrizzleBookRepository } from './repositories/drizzle-book.repository.js';
import { DrizzleOutboxRepository } from './outbox/drizzle-outbox.repository.js';

export class DrizzleUnitOfWork implements UnitOfWorkPort {
    constructor(private readonly db: Db) {}

    async run<T>(work: (repos: TransactionalRepos) => Promise<T>): Promise<T> {
        return this.db.transaction(async (tx) =>
            work({
                bookRepo: new DrizzleBookRepository(tx),
                outboxRepo: new DrizzleOutboxRepository(tx),
            }),
        );
    }
}
