import { randomUUID } from 'crypto';

import { runBookRepositoryContractTests } from '../domain/ports/book-repository.contract.js';
import { FakeBookRepository } from './fake-book-repository.js';

runBookRepositoryContractTests(async () => ({
    repo: new FakeBookRepository(),
    authorId: randomUUID(),
    shelfId: randomUUID(),
    alternateShelfId: randomUUID(),
}));
