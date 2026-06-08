import { FakeShelfRepository } from './fake-shelf.repository.js';
import { runShelfRepositoryContractTests } from '../domain/ports/shelf-repository.contract.js';

runShelfRepositoryContractTests(async () => {
    const repo = new FakeShelfRepository();

    return {
        repo,
        seed: async (shelf) => {
            repo.seed(shelf);
        },
    };
});
