import { OutboxEventType } from '@reading-room/common';

export type DeadLetterEntry = {
    outboxId: string;
    aggregateId: string;
    type: OutboxEventType;
    payload: Record<string, unknown>;
    deliveryCount: number;
    error: string;
};

export type DlqEventRecord = DeadLetterEntry & {
    id: string;
    createdAt: Date;
};

export interface DeadLetterStorePort {
    append(entry: DeadLetterEntry): Promise<void>;
    list(): Promise<DlqEventRecord[]>;
}
