import { Book, EntityKind, ReadingStatus, UpdateBookDto } from '@reading-room/common';

import { LoggerPort } from '../../telemetry/logger.port.js';
import { canRate, canTransition } from '../book-rules/book-rules.js';
import { NotFoundError, RuleError, notFoundMessage, ruleMessage } from '../errors/index.js';
import { StorePort } from '../ports/store.port.js';

type UpdateBookDeps = {
    store: StorePort;
    logger: LoggerPort;
};

export const updateBook = async (deps: UpdateBookDeps, dto: UpdateBookDto): Promise<Book> => {
    deps.logger.info({}, 'updateBook: started', { bookId: dto.id });

    const current = await deps.store.books.findById(dto.id);
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

    deps.logger.info({}, 'updateBook: validation passed, writing update', { bookId: dto.id });

    return deps.store.books.updateWithToken(dto);
};
