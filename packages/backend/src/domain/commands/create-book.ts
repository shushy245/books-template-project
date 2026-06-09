import { Book, CreateBookDto, EntityKind, OutboxEventType } from '@reading-room/common';

import { NotFoundError, notFoundMessage } from '../errors/index.ts';
import { StorePort } from '../ports/store.port.ts';
import { LoggerPort } from '../../telemetry/logger.port.ts';

type CreateBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const createBook = async ({ store, logger }: CreateBookDeps, dto: CreateBookDto): Promise<Book> => {
    logger.info({}, 'createBook: started', { shelfId: dto.shelfId });

    const shelf = await store.shelves.findById(dto.shelfId);
    if (shelf === undefined) {
        logger.info({}, 'createBook: shelf not found', { shelfId: dto.shelfId });
        throw new NotFoundError(notFoundMessage('createBook', EntityKind.Shelf, dto.shelfId));
    }

    const author = await store.authors.findById(dto.authorId);
    if (author === undefined) {
        logger.info({}, 'createBook: author not found', { authorId: dto.authorId });
        throw new NotFoundError(notFoundMessage('createBook', EntityKind.Author, dto.authorId));
    }

    logger.info({}, 'createBook: shelf and author validated, writing book and outbox event');

    return store.transaction(async ({ books, outbox }) => {
        const book = await books.insert(dto);

        await outbox.append({
            aggregateId: book.id,
            type: OutboxEventType.BookCreated,
            payload: { bookId: book.id, title: book.title, status: book.status },
        });

        logger.info({}, 'createBook: book created', { bookId: book.id });

        return book;
    });
};
