import { Book, EntityKind, OutboxEventType, ReadingStatus, UpdateBookDto } from '@reading-room/common';

import { StorePort } from '../ports/store.port.ts';
import { LoggerPort } from '../../telemetry/logger.port.ts';
import { canRate, canTransition } from '../book-rules/book-rules.ts';
import { NotFoundError, RuleError, notFoundMessage, ruleMessage } from '../errors';

type UpdateBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const updateBook = async ({ store, logger }: UpdateBookDeps, dto: UpdateBookDto): Promise<Book> => {
    logger.info({}, 'updateBook: started', { bookId: dto.id });

    const current = await store.books.findById(dto.id);
    if (current === undefined) {
        throw new NotFoundError(notFoundMessage('updateBook', EntityKind.Book, dto.id));
    }

    if (dto.status !== undefined && !canTransition(current.status, dto.status)) {
        throw new RuleError(ruleMessage('updateBook', `${current.status} → ${dto.status} is not a valid transition`));
    }

    const effectiveStatus: ReadingStatus = dto.status ?? current.status;
    if (dto.rating !== undefined && !canRate(effectiveStatus)) {
        throw new RuleError(
            ruleMessage(
                'updateBook',
                `rating requires status ${ReadingStatus.Read}, current effective status is ${effectiveStatus}`,
            ),
        );
    }

    logger.info({}, 'updateBook: validation passed, writing update and outbox event', { bookId: dto.id });

    return store.transaction(async ({ books, outbox }) => {
        const updated = await books.updateWithToken(dto);

        await outbox.append({
            aggregateId: updated.id,
            type: OutboxEventType.BookUpdated,
            payload: { bookId: updated.id, title: updated.title, status: updated.status, rating: updated.rating },
        });

        logger.info({}, 'updateBook: book updated', { bookId: updated.id });

        return updated;
    });
};
