import { EventDispatcherPort } from '../../domain/ports/event-dispatcher.port.js';
import { OutboxRecord } from '../../domain/ports/outbox-repository.port.js';
import { LoggerPort } from '../../telemetry/logger.port.js';

// Placeholder downstream: logs the event instead of publishing to a broker.
// Swap this adapter for a Kafka/Rabbit one — the relay never changes.
export class LoggingEventDispatcher implements EventDispatcherPort {
    constructor(private readonly logger: LoggerPort) {}

    async dispatch(event: OutboxRecord): Promise<void> {
        this.logger.info({}, 'LoggingEventDispatcher: dispatch', {
            outboxId: event.id,
            aggregateId: event.aggregateId,
            type: event.type,
        });
    }
}
