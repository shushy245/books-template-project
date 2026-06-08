import { EventDispatcherPort } from '../domain/ports/event-dispatcher.port.js';
import { OutboxRecord } from '../domain/ports/outbox-repository.port.js';

export class FakeEventDispatcher implements EventDispatcherPort {
    private readonly dispatched: OutboxRecord[] = [];
    readonly failFor = new Set<string>();

    get events(): OutboxRecord[] {
        return this.dispatched;
    }

    async dispatch(event: OutboxRecord): Promise<void> {
        if (this.failFor.has(event.id))
            throw new Error(`FakeEventDispatcher: dispatch forced failure for id=${event.id}`);
        this.dispatched.push(event);
    }
}
