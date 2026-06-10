import { Book, CreateBookDto, ReadingStatus } from '@reading-room/common';

type BookState = {
    id: string;
    title: string;
    authorId: string;
    shelfId: string;
    status: ReadingStatus;
    rating?: number;
};

class BookBuilder {
    private state: BookState = {
        id: 'book-id',
        title: 'Test Book',
        authorId: 'author-id',
        shelfId: 'shelf-id',
        status: ReadingStatus.WantToRead,
    };

    constructor(overrides?: Partial<BookState>) {
        this.state = { ...this.state, ...overrides };
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

    withShelfId(shelfId: string): this {
        this.state = { ...this.state, shelfId };
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
        const now = new Date();

        return {
            id: this.state.id,
            title: this.state.title,
            authorId: this.state.authorId,
            shelfId: this.state.shelfId,
            status: this.state.status,
            ...(this.state.rating !== undefined ? { rating: this.state.rating } : {}),
            createdAt: now,
            updatedAt: now,
        };
    }

    buildDTO(): CreateBookDto {
        return {
            title: this.state.title,
            authorId: this.state.authorId,
            shelfId: this.state.shelfId,
            status: this.state.status,
        };
    }
}

export const aBook = (...args: ConstructorParameters<typeof BookBuilder>): BookBuilder => new BookBuilder(...args);
