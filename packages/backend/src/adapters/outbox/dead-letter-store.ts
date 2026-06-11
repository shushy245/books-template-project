import { z } from 'zod';
import { asc } from 'drizzle-orm';
import { OutboxEventType } from '@reading-room/common';

import { Db } from '../../db/client.ts';
import { dlqEvents } from '../../db/schema.ts';
import { DeadLetterEntry, DeadLetterStorePort, DlqEventRecord } from '../../domain/ports/dead-letter-store.port.ts';

const OutboxEventTypeSchema = z.nativeEnum(OutboxEventType);
const DlqPayloadSchema = z.record(z.string(), z.unknown());

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

    async list(): Promise<DlqEventRecord[]> {
        const rows = await this.db.select().from(dlqEvents).orderBy(asc(dlqEvents.createdAt));

        return rows.map((row) => ({
            id: row.id,
            outboxId: row.outboxId,
            aggregateId: row.aggregateId,
            type: OutboxEventTypeSchema.parse(row.type),
            payload: DlqPayloadSchema.parse(row.payload),
            deliveryCount: row.deliveryCount,
            error: row.error,
            createdAt: row.createdAt,
        }));
    }
}
