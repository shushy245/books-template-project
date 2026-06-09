import { Db } from '../../db/client.ts';
import { dlqEvents } from '../../db/schema.ts';
import { DeadLetterEntry, DeadLetterStorePort } from '../../domain/ports/dead-letter-store.port.ts';

export class DeadLetterStore implements DeadLetterStorePort {
    constructor(private readonly db: Db) {}

    async append(entry: DeadLetterEntry): Promise<void> {
        await this.db.insert(dlqEvents).values({
            outboxId: entry.outboxId,
            aggregateId: entry.aggregateId,
            type: entry.type,
            payload: entry.payload,
            deliveryCount: entry.deliveryCount,
            error: entry.error,
        });
    }
}
