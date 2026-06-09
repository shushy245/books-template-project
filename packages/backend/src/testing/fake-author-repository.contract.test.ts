import { FakeAuthorRepository } from './fake-author.repository.ts';
import { runAuthorRepositoryContractTests } from '../domain/ports/author-repository.contract.ts';

runAuthorRepositoryContractTests(async () => {
    const repo = new FakeAuthorRepository();

    return {
        repo,
        seed: async (author) => {
            repo.seed(author);
        },
    };
});
