import { OutboxRecord } from './outbox-repository.port.js';

// The relay's downstream target. Today a logging adapter; swap for a Kafka/Rabbit
// adapter later without touching the relay — the port is the seam.
export interface EventDispatcherPort {
    dispatch(event: OutboxRecord): Promise<void>;
}
