import { eq, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';

import { OutboxEventType } from '@reading-room/common';

import { Db } from '../../db/client.js';
import { outbox } from '../../db/schema.js';
import { OutboxEvent, OutboxRecord, OutboxRepositoryPort } from '../../domain/ports/outbox-repository.port.js';

const OutboxEventTypeSchema = z.nativeEnum(OutboxEventType);
const OutboxPayloadSchema = z.record(z.string(), z.unknown());

const FETCH_LIMIT = 100;

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
            .orderBy(outbox.createdAt)
            .limit(FETCH_LIMIT);

        return rows.map((row) => ({
            id: row.id,
            aggregateId: row.aggregateId,
            type: OutboxEventTypeSchema.parse(row.type),
            payload: OutboxPayloadSchema.parse(row.payload),
            deliveryCount: row.deliveryCount,
            processedAt: row.processedAt ?? undefined,
        }));
    }

    async markProcessed(id: string): Promise<void> {
        await this.db.update(outbox).set({ processedAt: new Date() }).where(eq(outbox.id, id));
    }

    async incrementDeliveryCount(id: string): Promise<void> {
        await this.db
            .update(outbox)
            .set({ deliveryCount: sql`${outbox.deliveryCount} + 1` })
            .where(eq(outbox.id, id));
    }
}
