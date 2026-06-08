import { randomUUID } from 'crypto';

import { Author } from '@reading-room/common';

type AuthorState = {
    id: string;
    name: string;
};

class AuthorBuilder {
    private state: AuthorState = {
        id: 'author-id',
        name: 'Test Author',
    };

    constructor(overrides?: Partial<AuthorState>) {
        this.state = { ...this.state, ...overrides };
    }

    withId(id: string): this {
        this.state = { ...this.state, id };
        return this;
    }

    withName(name: string): this {
        this.state = { ...this.state, name };
        return this;
    }

    build(): Author {
        const now = new Date();
        return { id: this.state.id, name: this.state.name, createdAt: now, updatedAt: now };
    }
}

export const anAuthor = (...args: ConstructorParameters<typeof AuthorBuilder>): AuthorBuilder =>
    new AuthorBuilder(...args);

export const anAuthorWithRandomId = (): AuthorBuilder => new AuthorBuilder({ id: randomUUID() });
