import { OutboxEventType } from '@reading-room/common';

export type OutboxEvent = {
    aggregateId: string;
    type: OutboxEventType;
    payload: Record<string, unknown>;
};

export type OutboxRecord = OutboxEvent & {
    id: string;
    processedAt: Date | undefined;
};

export interface OutboxRepositoryPort {
    append(event: OutboxEvent): Promise<void>;
    fetchUnprocessed(): Promise<OutboxRecord[]>;
    markProcessed(id: string): Promise<void>;
}
