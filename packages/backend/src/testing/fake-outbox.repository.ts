import { OutboxEvent, OutboxRecord, OutboxRepositoryPort } from '../domain/ports/outbox-repository.port.js';

let nextId = 1;

export class FakeOutboxRepository implements OutboxRepositoryPort {
    private readonly records: OutboxRecord[] = [];

    get events(): OutboxRecord[] {
        return this.records;
    }

    async append(event: OutboxEvent): Promise<void> {
        this.records.push({ ...event, id: String(nextId++), processedAt: undefined });
    }

    async fetchUnprocessed(): Promise<OutboxRecord[]> {
        return this.records.filter((r) => r.processedAt === undefined);
    }

    async markProcessed(id: string): Promise<void> {
        const record = this.records.find((r) => r.id === id);
        if (record !== undefined) record.processedAt = new Date();
    }
}
