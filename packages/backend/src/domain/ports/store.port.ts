import { BookRepositoryPort } from './book-repository.port.ts';
import { AuthorRepositoryPort } from './author-repository.port.ts';
import { OutboxRepositoryPort } from './outbox-repository.port.ts';
import { ShelfRepositoryPort } from './shelf-repository.port.ts';
import { DeadLetterStorePort } from './dead-letter-store.port.ts';

export type TransactionRepos = {
    books: BookRepositoryPort;
    outbox: OutboxRepositoryPort;
    deadLetters: DeadLetterStorePort;
};

export interface StorePort {
    books: BookRepositoryPort;
    authors: AuthorRepositoryPort;
    shelves: ShelfRepositoryPort;
    outbox: OutboxRepositoryPort;
    deadLetters: DeadLetterStorePort;
    transaction: <T>(work: (repos: TransactionRepos) => Promise<T>) => Promise<T>;
}
