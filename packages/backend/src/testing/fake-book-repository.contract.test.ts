import { randomUUID } from 'crypto';

import { FakeBookRepository } from './fake-book-repository.ts';
import { runBookRepositoryContractTests } from '../domain/ports/book-repository.contract.ts';

runBookRepositoryContractTests(async () => ({
    repo: new FakeBookRepository(),
    authorId: randomUUID(),
    shelfId: randomUUID(),
    alternateShelfId: randomUUID(),
}));
