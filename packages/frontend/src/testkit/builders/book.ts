import Chance from 'chance';
import { Book, ReadingStatus } from '@reading-room/common';

const chance = new Chance();

class BookBuilder {
    private state: Book = {
        id: chance.guid(),
        title: chance.sentence({ words: 3 }),
        authorId: chance.guid(),
        shelfId: chance.guid(),
        status: ReadingStatus.WantToRead,
        createdAt: chance.date(),
        updatedAt: chance.date(),
    };

    constructor(overrides?: Partial<Book>) {
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
