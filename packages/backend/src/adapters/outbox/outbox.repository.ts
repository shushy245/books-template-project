import { Db } from '../../db/client.js';
import { outbox } from '../../db/schema.js';
import { OutboxEvent, OutboxRepositoryPort } from '../../domain/ports/outbox.port.js';

export class OutboxRepository implements OutboxRepositoryPort {
    constructor(private readonly db: Db) {}

    async append(event: OutboxEvent): Promise<void> {
        await this.db.insert(outbox).values({
            aggregateId: event.aggregateId,
            type: event.type,
            payload: event.payload,
        });
    }
}
