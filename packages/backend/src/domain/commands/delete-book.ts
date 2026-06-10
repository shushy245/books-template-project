import { EntityKind, OutboxEventType } from '@reading-room/common';

import { StorePort } from '../ports/store.port.ts';
import { NotFoundError, notFoundMessage } from '../errors';
import { LoggerPort } from '../../telemetry/logger.port.ts';

type DeleteBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const deleteBook = async ({ store, logger }: DeleteBookDeps, id: string): Promise<void> => {
    logger.info({}, 'deleteBook: started', { bookId: id });

    const book = await store.books.findById(id);
    if (book === undefined) {
        throw new NotFoundError(notFoundMessage('deleteBook', EntityKind.Book, id));
    }

    await store.transaction(async ({ books, outbox }) => {
        await books.delete(id);
        await outbox.append({
            aggregateId: id,
            type: OutboxEventType.BookDeleted,
            payload: { bookId: id, title: book.title },
        });

        logger.info({}, 'deleteBook: book deleted', { bookId: id });
    });
};
