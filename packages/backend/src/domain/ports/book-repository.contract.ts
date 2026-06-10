import { beforeEach, describe, expect, it } from 'vitest';

import { BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

import { aBook } from '../../testing/builders/index.ts';
import { ConflictError } from '../errors/conflict.error.ts';
import { NotFoundError } from '../errors/not-found.error.ts';
import { BookRepositoryPort } from './book-repository.port.ts';

type TestContext = {
    repo: BookRepositoryPort;
    authorId: string;
    shelfId: string;
    alternateShelfId: string;
};

export const runBookRepositoryContractTests = (setup: () => Promise<TestContext>): void => {
    describe('BookRepository contract', () => {
        let ctx: TestContext;

        beforeEach(async () => {
            ctx = await setup();
        });

        const insert = (overrides?: Parameters<typeof aBook>[0]) =>
            ctx.repo.insert(aBook({ authorId: ctx.authorId, shelfId: ctx.shelfId, ...overrides }).buildDTO());

        describe('findById', () => {
            it('returns undefined when the book does not exist', async () => {
                const result = await ctx.repo.findById('00000000-0000-0000-0000-000000000000');

                expect(result).toBeUndefined();
            });

            it('returns the book when it exists', async () => {
                const book = await insert({ title: 'Dune' });

                const found = await ctx.repo.findById(book.id);

                expect(found).toEqual(book);
            });
        });

        describe('insert', () => {
            it('persists a book and returns it with a generated id and timestamps', async () => {
                const book = await insert({ title: 'Dune' });

                expect(book.id).toBeDefined();
                expect(book.title).toBe('Dune');
                expect(book.status).toBe(ReadingStatus.WantToRead);
                expect(book.createdAt).toBeInstanceOf(Date);
                expect(book.updatedAt).toBeInstanceOf(Date);
                expect(book.rating).toBeUndefined();
            });
        });

        describe('list', () => {
            it('returns all books', async () => {
                await insert({ title: 'A' });
                await insert({ title: 'B' });

                const result = await ctx.repo.list({});

                expect(result.total).toBe(2);
                expect(result.items).toHaveLength(2);
            });

            it('returns the most recently inserted book first by default', async () => {
                const first = await insert({ title: 'First' });
                const second = await insert({ title: 'Second' });

                const result = await ctx.repo.list({});

                expect(result.items[0]?.id).toBe(second.id);
                expect(result.items[1]?.id).toBe(first.id);
            });

            it('filters by shelfId', async () => {
                await insert({ title: 'On Shelf 1' });
                await ctx.repo.insert(
                    aBook({ title: 'On Shelf 2', authorId: ctx.authorId, shelfId: ctx.alternateShelfId }).buildDTO(),
                );

                const result = await ctx.repo.list({ shelfId: ctx.shelfId });

                expect(result.total).toBe(1);
                expect(result.items[0]?.shelfId).toBe(ctx.shelfId);
            });

            it('filters by status', async () => {
                await insert({ title: 'Want To Read' });
                await insert({ title: 'Reading', status: ReadingStatus.Reading });

                const result = await ctx.repo.list({ status: ReadingStatus.Reading });

                expect(result.total).toBe(1);
                expect(result.items[0]?.status).toBe(ReadingStatus.Reading);
            });

            it('sorts by title ascending', async () => {
                await insert({ title: 'Z Book' });
                await insert({ title: 'A Book' });
                await insert({ title: 'M Book' });

                const result = await ctx.repo.list({ sortBy: BookSortField.Title, sortDir: SortDirection.Asc });

                expect(result.items[0]?.title).toBe('A Book');
                expect(result.items[1]?.title).toBe('M Book');
                expect(result.items[2]?.title).toBe('Z Book');
            });

            it('paginates correctly — page 2 returns the next slice', async () => {
                await insert({ title: 'A' });
                await insert({ title: 'B' });
                await insert({ title: 'C' });

                const result = await ctx.repo.list({
                    sortBy: BookSortField.Title,
                    sortDir: SortDirection.Asc,
                    page: 2,
                    pageSize: 2,
                });

                expect(result.items).toHaveLength(1);
                expect(result.items[0]?.title).toBe('C');
                expect(result.total).toBe(3);
                expect(result.page).toBe(2);
            });

            it('returns an empty page when the requested page is beyond the data', async () => {
                await insert({ title: 'A' });

                const result = await ctx.repo.list({ page: 99, pageSize: 10 });

                expect(result.items).toHaveLength(0);
                expect(result.total).toBe(1);
            });
        });

        describe('updateWithToken', () => {
            it('updates the status and bumps updatedAt', async () => {
                const book = await insert({ title: 'Dune' });

                const updated = await ctx.repo.updateWithToken({
                    id: book.id,
                    updatedAt: book.updatedAt,
                    status: ReadingStatus.Reading,
                });

                expect(updated.status).toBe(ReadingStatus.Reading);
                expect(updated.updatedAt.getTime()).toBeGreaterThan(book.updatedAt.getTime());
            });

            it('updates the rating when provided', async () => {
                const book = await insert({ title: 'Dune', status: ReadingStatus.Read });

                const updated = await ctx.repo.updateWithToken({ id: book.id, updatedAt: book.updatedAt, rating: 5 });

                expect(updated.rating).toBe(5);
            });

            it('throws ConflictError when the token is stale', async () => {
                const book = await insert({ title: 'Dune' });
                await ctx.repo.updateWithToken({
                    id: book.id,
                    updatedAt: book.updatedAt,
                    status: ReadingStatus.Reading,
                });

                await expect(
                    ctx.repo.updateWithToken({ id: book.id, updatedAt: book.updatedAt, status: ReadingStatus.Read }),
                ).rejects.toThrow(ConflictError);
            });

            it('throws NotFoundError when the book does not exist', async () => {
                await expect(
                    ctx.repo.updateWithToken({
                        id: '00000000-0000-0000-0000-000000000000',
                        updatedAt: new Date(),
                        status: ReadingStatus.Reading,
                    }),
                ).rejects.toThrow(NotFoundError);
            });
        });

        describe('delete', () => {
            it('removes the book', async () => {
                const book = await insert({ title: 'Dune' });

                await ctx.repo.delete(book.id);

                expect(await ctx.repo.findById(book.id)).toBeUndefined();
            });

            it('throws NotFoundError when the book does not exist', async () => {
                await expect(ctx.repo.delete('00000000-0000-0000-0000-000000000000')).rejects.toThrow(NotFoundError);
            });
        });
    });
};
