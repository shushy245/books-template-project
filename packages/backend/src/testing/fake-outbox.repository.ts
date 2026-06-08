import { OutboxEvent, OutboxRecord, OutboxRepositoryPort } from '../domain/ports/outbox-repository.port.js';

export class FakeOutboxRepository implements OutboxRepositoryPort {
    private readonly records: OutboxRecord[] = [];
    private nextId = 1;
    readonly failOnMarkProcessed = new Set<string>();

    get events(): OutboxRecord[] {
        return this.records;
    }

    async append(event: OutboxEvent): Promise<void> {
        this.records.push({ ...event, id: String(this.nextId++), deliveryCount: 0, processedAt: undefined });
    }

    async fetchUnprocessed(): Promise<OutboxRecord[]> {
        return this.records.filter((r) => r.processedAt === undefined);
    }

    async markProcessed(id: string): Promise<void> {
        if (this.failOnMarkProcessed.has(id))
            throw new Error(`FakeOutboxRepository: markProcessed forced failure for id=${id}`);
        const record = this.records.find((r) => r.id === id);
        if (record === undefined) return;
        const idx = this.records.indexOf(record);
        this.records[idx] = { ...record, processedAt: new Date() };
    }

    async incrementDeliveryCount(id: string): Promise<void> {
        const record = this.records.find((r) => r.id === id);
        if (record === undefined) return;
        const idx = this.records.indexOf(record);
        this.records[idx] = { ...record, deliveryCount: record.deliveryCount + 1 };
    }
}
