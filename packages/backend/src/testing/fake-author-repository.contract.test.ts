import { FakeAuthorRepository } from './fake-author.repository.js';
import { runAuthorRepositoryContractTests } from '../domain/ports/author-repository.contract.js';

runAuthorRepositoryContractTests(async () => {
    const repo = new FakeAuthorRepository();

    return {
        repo,
        seed: async (author) => {
            repo.seed(author);
        },
    };
});
