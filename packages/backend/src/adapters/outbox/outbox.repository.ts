import { eq, isNull } from 'drizzle-orm';

import { OutboxEventType } from '@reading-room/common';

import { Db } from '../../db/client.js';
import { outbox } from '../../db/schema.js';
import { OutboxEvent, OutboxRecord, OutboxRepositoryPort } from '../../domain/ports/outbox-repository.port.js';

export class OutboxRepository implements OutboxRepositoryPort {
    constructor(private readonly db: Db) {}

    async append(event: OutboxEvent): Promise<void> {
        await this.db.insert(outbox).values({
            aggregateId: event.aggregateId,
            type: event.type,
            payload: event.payload,
        });
    }

    async fetchUnprocessed(): Promise<OutboxRecord[]> {
        const rows = await this.db
            .select()
            .from(outbox)
            .where(isNull(outbox.processedAt))
            .orderBy(outbox.createdAt);

        return rows.map((row) => ({
            id: row.id,
            aggregateId: row.aggregateId,
            type: row.type as OutboxEventType,
            payload: row.payload as Record<string, unknown>,
            processedAt: row.processedAt ?? undefined,
        }));
    }

    async markProcessed(id: string): Promise<void> {
        await this.db.update(outbox).set({ processedAt: new Date() }).where(eq(outbox.id, id));
    }
}
