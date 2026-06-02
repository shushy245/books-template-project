import { Book, CreateBookDto, EntityKind, OutboxEventType } from '@reading-room/common';

import { NotFoundError, notFoundMessage } from '../errors/index.js';
import { StorePort } from '../ports/store.port.js';
import { Logger } from '../../telemetry/logger.port.js';

type CreateBookDeps = {
    store: StorePort;
    logger: Logger;
};

export const createBook = async (deps: CreateBookDeps, dto: CreateBookDto): Promise<Book> => {
    deps.logger.info({}, 'createBook: started', { shelfId: dto.shelfId });

    const shelf = await deps.store.shelves.findById(dto.shelfId);
    if (shelf === undefined) {
        deps.logger.info({}, 'createBook: shelf not found', { shelfId: dto.shelfId });
        throw new NotFoundError(notFoundMessage('createBook', EntityKind.Shelf, dto.shelfId));
    }

    deps.logger.info({}, 'createBook: shelf validated, writing book and outbox event');

    return deps.store.transaction(async ({ books, outbox }) => {
        const book = await books.insert(dto);

        await outbox.append({
            aggregateId: book.id,
            type: OutboxEventType.BookCreated,
            payload: { bookId: book.id, title: book.title, status: book.status },
        });

        deps.logger.info({}, 'createBook: book created', { bookId: book.id });

        return book;
    });
};
