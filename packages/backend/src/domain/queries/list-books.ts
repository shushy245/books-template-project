import { Book, BookQueryDto, PaginatedResult } from '@reading-room/common';

import { BookRepositoryPort } from '../ports/book-repository.port.js';

type ListBooksDeps = {
    bookRepo: BookRepositoryPort;
};

export const listBooks = ({ bookRepo }: ListBooksDeps, query: BookQueryDto): Promise<PaginatedResult<Book>> =>
    bookRepo.list(query);
