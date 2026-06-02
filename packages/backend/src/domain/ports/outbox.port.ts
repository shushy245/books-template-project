import { OutboxEventType } from '@reading-room/common';

export type OutboxEvent = {
    aggregateId: string;
    type: OutboxEventType;
    payload: Record<string, unknown>;
};

export interface OutboxRepositoryPort {
    append(event: OutboxEvent): Promise<void>;
}
