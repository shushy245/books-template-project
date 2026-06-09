import { FakeShelfRepository } from './fake-shelf.repository.ts';
import { runShelfRepositoryContractTests } from '../domain/ports/shelf-repository.contract.ts';

runShelfRepositoryContractTests(async () => {
    const repo = new FakeShelfRepository();

    return {
        repo,
        seed: async (shelf) => {
            repo.seed(shelf);
        },
    };
});
