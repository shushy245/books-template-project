import { beforeEach, describe, expect, it } from 'vitest';

import { BookSortField, ReadingStatus, SortDirection } from '@reading-room/common';

import { ConflictError } from '../errors/conflict.error.js';
import { NotFoundError } from '../errors/not-found.error.js';
import { BookRepositoryPort } from './book-repository.port.js';

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

        describe('findById', () => {
            it('returns undefined when the book does not exist', async () => {
                const result = await ctx.repo.findById('00000000-0000-0000-0000-000000000000');
                expect(result).toBeUndefined();
            });

            it('returns the book when it exists', async () => {
                const book = await ctx.repo.insert({
                    title: 'Dune',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                const found = await ctx.repo.findById(book.id);
                expect(found).toEqual(book);
            });
        });

        describe('insert', () => {
            it('persists a book and returns it with a generated id and timestamps', async () => {
                const book = await ctx.repo.insert({
                    title: 'Dune',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
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
                await ctx.repo.insert({
                    title: 'A',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                await ctx.repo.insert({
                    title: 'B',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                const result = await ctx.repo.list({});
                expect(result.total).toBe(2);
                expect(result.items).toHaveLength(2);
            });

            it('returns the most recently inserted book first by default', async () => {
                const first = await ctx.repo.insert({
                    title: 'First',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                const second = await ctx.repo.insert({
                    title: 'Second',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                const result = await ctx.repo.list({});
                expect(result.items[0]?.id).toBe(second.id);
                expect(result.items[1]?.id).toBe(first.id);
            });

            it('filters by shelfId', async () => {
                await ctx.repo.insert({
                    title: 'On Shelf 1',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                await ctx.repo.insert({
                    title: 'On Shelf 2',
                    authorId: ctx.authorId,
                    shelfId: ctx.alternateShelfId,
                    status: ReadingStatus.WantToRead,
                });
                const result = await ctx.repo.list({ shelfId: ctx.shelfId });
                expect(result.total).toBe(1);
                expect(result.items[0]?.shelfId).toBe(ctx.shelfId);
            });

            it('filters by status', async () => {
                await ctx.repo.insert({
                    title: 'Want To Read',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                await ctx.repo.insert({
                    title: 'Reading',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.Reading,
                });
                const result = await ctx.repo.list({ status: ReadingStatus.Reading });
                expect(result.total).toBe(1);
                expect(result.items[0]?.status).toBe(ReadingStatus.Reading);
            });

            it('sorts by title ascending', async () => {
                await ctx.repo.insert({
                    title: 'Z Book',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                await ctx.repo.insert({
                    title: 'A Book',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                await ctx.repo.insert({
                    title: 'M Book',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                const result = await ctx.repo.list({ sortBy: BookSortField.Title, sortDir: SortDirection.Asc });
                expect(result.items[0]?.title).toBe('A Book');
                expect(result.items[1]?.title).toBe('M Book');
                expect(result.items[2]?.title).toBe('Z Book');
            });

            it('paginates correctly — page 2 returns the next slice', async () => {
                await ctx.repo.insert({
                    title: 'A',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                await ctx.repo.insert({
                    title: 'B',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                await ctx.repo.insert({
                    title: 'C',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
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
                await ctx.repo.insert({
                    title: 'A',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                const result = await ctx.repo.list({ page: 99, pageSize: 10 });
                expect(result.items).toHaveLength(0);
                expect(result.total).toBe(1);
            });
        });

        describe('updateWithToken', () => {
            it('updates the status and bumps updatedAt', async () => {
                const book = await ctx.repo.insert({
                    title: 'Dune',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                const updated = await ctx.repo.updateWithToken({
                    id: book.id,
                    updatedAt: book.updatedAt,
                    status: ReadingStatus.Reading,
                });
                expect(updated.status).toBe(ReadingStatus.Reading);
                expect(updated.updatedAt.getTime()).toBeGreaterThan(book.updatedAt.getTime());
            });

            it('updates the rating when provided', async () => {
                const book = await ctx.repo.insert({
                    title: 'Dune',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.Read,
                });
                const updated = await ctx.repo.updateWithToken({ id: book.id, updatedAt: book.updatedAt, rating: 5 });
                expect(updated.rating).toBe(5);
            });

            it('throws ConflictError when the token is stale', async () => {
                const book = await ctx.repo.insert({
                    title: 'Dune',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                // First update consumes the original token, bumping updatedAt.
                await ctx.repo.updateWithToken({
                    id: book.id,
                    updatedAt: book.updatedAt,
                    status: ReadingStatus.Reading,
                });
                // Second update re-uses the original (now stale) token.
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
                const book = await ctx.repo.insert({
                    title: 'Dune',
                    authorId: ctx.authorId,
                    shelfId: ctx.shelfId,
                    status: ReadingStatus.WantToRead,
                });
                await ctx.repo.delete(book.id);
                const found = await ctx.repo.findById(book.id);
                expect(found).toBeUndefined();
            });

            it('throws NotFoundError when the book does not exist', async () => {
                await expect(ctx.repo.delete('00000000-0000-0000-0000-000000000000')).rejects.toThrow(NotFoundError);
            });
        });
    });
};
