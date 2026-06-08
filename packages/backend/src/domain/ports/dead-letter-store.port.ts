import { OutboxEventType } from '@reading-room/common';

export type DeadLetterEntry = {
    outboxId: string;
    aggregateId: string;
    type: OutboxEventType;
    payload: Record<string, unknown>;
    deliveryCount: number;
    error: string;
};

export interface DeadLetterStorePort {
    append(entry: DeadLetterEntry): Promise<void>;
}
