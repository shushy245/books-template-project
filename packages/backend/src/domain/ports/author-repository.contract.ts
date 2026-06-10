import { randomUUID } from 'crypto';

import { beforeEach, describe, expect, it } from 'vitest';

import { Author } from '@reading-room/common';

import { anAuthor } from '../../testing/builders';
import { AuthorRepositoryPort } from './author-repository.port.ts';

type TestContext = {
    repo: AuthorRepositoryPort;
    seed: (author: Author) => Promise<void>;
};

export const runAuthorRepositoryContractTests = (setup: () => Promise<TestContext>): void => {
    describe('AuthorRepository contract', () => {
        let ctx: TestContext;

        beforeEach(async () => {
            ctx = await setup();
        });

        const seedAuthor = async (name = 'Test Author'): Promise<Author> => {
            const author = anAuthor({ id: randomUUID() }).withName(name).build();
            await ctx.seed(author);

            return author;
        };

        describe('findById', () => {
            it('returns undefined when the author does not exist', async () => {
                const result = await ctx.repo.findById('00000000-0000-0000-0000-000000000000');

                expect(result).toBeUndefined();
            });

            it('returns the author when it exists', async () => {
                const author = await seedAuthor('Le Guin');

                const found = await ctx.repo.findById(author.id);

                expect(found?.name).toBe('Le Guin');
            });
        });

        describe('list', () => {
            it('returns an empty array when there are no authors', async () => {
                const result = await ctx.repo.list();

                expect(result).toEqual([]);
            });

            it('returns all seeded authors sorted by name ascending', async () => {
                await seedAuthor('Le Guin');
                await seedAuthor('Herbert');

                const result = await ctx.repo.list();

                expect(result.map((a) => a.name)).toEqual(['Herbert', 'Le Guin']);
            });
        });
    });
};
