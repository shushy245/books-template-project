import { BookRepositoryPort } from './book-repository.port.js';
import { OutboxRepositoryPort } from './outbox-repository.port.js';
import { ShelfRepositoryPort } from './shelf-repository.port.js';

export type TransactionRepos = {
    books: BookRepositoryPort;
    outbox: OutboxRepositoryPort;
};

export interface StorePort {
    books: BookRepositoryPort;
    shelves: ShelfRepositoryPort;
    outbox: OutboxRepositoryPort;
    transaction: <T>(work: (repos: TransactionRepos) => Promise<T>) => Promise<T>;
}
