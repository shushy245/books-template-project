import { beforeEach, describe, expect, it } from 'vitest';

import { Shelf } from '@reading-room/common';

import { aShelfWithRandomId } from '../../testing/builders/shelf.ts';
import { ShelfRepositoryPort } from './shelf-repository.port.ts';

type TestContext = {
    repo: ShelfRepositoryPort;
    seed: (shelf: Shelf) => Promise<void>;
};

export const runShelfRepositoryContractTests = (setup: () => Promise<TestContext>): void => {
    describe('ShelfRepository contract', () => {
        let ctx: TestContext;

        beforeEach(async () => {
            ctx = await setup();
        });

        const seedShelf = async (name = 'Test Shelf'): Promise<Shelf> => {
            const shelf = aShelfWithRandomId().withName(name).build();
            await ctx.seed(shelf);

            return shelf;
        };

        describe('findById', () => {
            it('returns undefined when the shelf does not exist', async () => {
                const result = await ctx.repo.findById('00000000-0000-0000-0000-000000000000');

                expect(result).toBeUndefined();
            });

            it('returns the shelf when it exists', async () => {
                const shelf = await seedShelf('Sci-Fi');

                const found = await ctx.repo.findById(shelf.id);

                expect(found?.name).toBe('Sci-Fi');
            });
        });

        describe('list', () => {
            it('returns an empty array when there are no shelves', async () => {
                const result = await ctx.repo.list();

                expect(result).toEqual([]);
            });

            it('returns all seeded shelves sorted by name ascending', async () => {
                await seedShelf('Sci-Fi');
                await seedShelf('Fantasy');

                const result = await ctx.repo.list();

                expect(result.map((s) => s.name)).toEqual(['Fantasy', 'Sci-Fi']);
            });
        });
    });
};
