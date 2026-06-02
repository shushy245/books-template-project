import { OutboxEvent, OutboxRepositoryPort } from '../domain/ports/outbox.port.js';

export class FakeOutboxRepository implements OutboxRepositoryPort {
    readonly events: OutboxEvent[] = [];

    async append(event: OutboxEvent): Promise<void> {
        this.events.push(event);
    }
}
