import { TransactionalRepos, UnitOfWorkPort } from '../domain/ports/unit-of-work.port.js';

import { FakeBookRepository } from './fake-book-repository.js';
import { FakeOutboxRepository } from './fake-outbox.repository.js';

export class FakeUnitOfWork implements UnitOfWorkPort {
    readonly bookRepo: FakeBookRepository;
    readonly outboxRepo: FakeOutboxRepository;

    constructor() {
        this.bookRepo = new FakeBookRepository();
        this.outboxRepo = new FakeOutboxRepository();
    }

    async run<T>(work: (repos: TransactionalRepos) => Promise<T>): Promise<T> {
        return work({ bookRepo: this.bookRepo, outboxRepo: this.outboxRepo });
    }
}
