import { Book, BookQueryDto, CreateBookDto, PaginatedResult, UpdateBookDto } from '@reading-room/common';

export interface BookRepositoryPort {
    findById(id: string): Promise<Book | undefined>;
    list(query: BookQueryDto): Promise<PaginatedResult<Book>>;
    insert(dto: CreateBookDto): Promise<Book>;
    updateWithToken(dto: UpdateBookDto): Promise<Book>;
    delete(id: string): Promise<void>;
}
