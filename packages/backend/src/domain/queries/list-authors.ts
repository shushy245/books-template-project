import { Author } from '@reading-room/common';

import { AuthorRepositoryPort } from '../ports/author-repository.port.js';

type ListAuthorsDeps = {
    authorRepo: AuthorRepositoryPort;
};

export const listAuthors = ({ authorRepo }: ListAuthorsDeps): Promise<Author[]> => authorRepo.list();
