import { Author } from '@reading-room/common';

export interface AuthorRepositoryPort {
    findById(id: string): Promise<Author | undefined>;
    list(): Promise<Author[]>;
}
