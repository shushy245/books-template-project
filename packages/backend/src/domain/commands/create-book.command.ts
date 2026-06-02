import { Book, CreateBookDto, EntityKind, OutboxEventType } from '@reading-room/common';

import { NotFoundError, notFoundMessage } from '../errors/index.js';
import { ShelfRepositoryPort } from '../ports/shelf-repository.port.js';
import { UnitOfWorkPort } from '../ports/unit-of-work.port.js';
import { Logger } from '../../telemetry/logger.port.js';

type CreateBookDeps = {
    shelfRepo: ShelfRepositoryPort;
    unitOfWork: UnitOfWorkPort;
    logger: Logger;
};

export const createBook = async (deps: CreateBookDeps, dto: CreateBookDto): Promise<Book> => {
    deps.logger.info({}, 'createBook: started', { shelfId: dto.shelfId });

    const shelf = await deps.shelfRepo.findById(dto.shelfId);
    if (shelf === undefined) {
        deps.logger.info({}, 'createBook: shelf not found', { shelfId: dto.shelfId });
        throw new NotFoundError(notFoundMessage('createBook', EntityKind.Shelf, dto.shelfId));
    }

    deps.logger.info({}, 'createBook: shelf validated, writing book and outbox event');

    return deps.unitOfWork.run(async ({ bookRepo, outboxRepo }) => {
        const book = await bookRepo.insert(dto);

        await outboxRepo.append({
            aggregateId: book.id,
            type: OutboxEventType.BookCreated,
            payload: { bookId: book.id, title: book.title, status: book.status },
        });

        deps.logger.info({}, 'createBook: book created', { bookId: book.id });

        return book;
    });
};
