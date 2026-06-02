import { randomUUID } from 'crypto';

import { FakeBookRepository } from './fake-book-repository.js';
import { runBookRepositoryContractTests } from '../domain/ports/book-repository.contract.js';

runBookRepositoryContractTests(async () => ({
    repo: new FakeBookRepository(),
    authorId: randomUUID(),
    shelfId: randomUUID(),
    alternateShelfId: randomUUID(),
}));
