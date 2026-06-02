import { BookRepositoryPort } from './book-repository.port.js';
import { OutboxRepositoryPort } from './outbox.port.js';

export type TransactionalRepos = {
    bookRepo: BookRepositoryPort;
    outboxRepo: OutboxRepositoryPort;
};

export interface UnitOfWorkPort {
    run<T>(work: (repos: TransactionalRepos) => Promise<T>): Promise<T>;
}
