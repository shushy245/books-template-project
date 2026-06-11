import { Shelf } from '@reading-room/common';

type ShelfState = {
    id: string;
    name: string;
};

class ShelfBuilder {
    private state: ShelfState = {
        id: 'shelf-id',
        name: 'Test Shelf',
    };

    constructor(overrides?: Partial<ShelfState>) {
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

    build(): Shelf {
        const now = new Date();

        return { id: this.state.id, name: this.state.name, createdAt: now, updatedAt: now };
    }
}

export const aShelf = (...args: ConstructorParameters<typeof ShelfBuilder>): ShelfBuilder => new ShelfBuilder(...args);
