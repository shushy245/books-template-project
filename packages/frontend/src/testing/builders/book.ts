import { Book, ReadingStatus } from '@reading-room/common';

class BookBuilder {
    private state: Book = {
        id: 'book-1',
        title: 'Dune',
        authorId: 'author-1',
        shelfId: 'shelf-1',
        status: ReadingStatus.WantToRead,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
    };

    constructor(overrides?: Partial<Book>) {
        if (overrides !== undefined) {
            this.state = { ...this.state, ...overrides };
        }
    }

    withId(id: string): this {
        this.state = { ...this.state, id };
        return this;
    }
    withTitle(title: string): this {
        this.state = { ...this.state, title };
        return this;
    }
    withAuthorId(authorId: string): this {
        this.state = { ...this.state, authorId };
        return this;
    }
    withStatus(status: ReadingStatus): this {
        this.state = { ...this.state, status };
        return this;
    }
    withRating(rating: number): this {
        this.state = { ...this.state, rating };
        return this;
    }

    build(): Book {
        return { ...this.state };
    }
}

export const aBook = (...args: ConstructorParameters<typeof BookBuilder>): BookBuilder => new BookBuilder(...args);
