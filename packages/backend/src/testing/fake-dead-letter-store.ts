import { DeadLetterEntry, DeadLetterStorePort } from '../domain/ports/dead-letter-store.port.js';

export class FakeDeadLetterStore implements DeadLetterStorePort {
    private readonly records: DeadLetterEntry[] = [];

    get entries(): DeadLetterEntry[] {
        return this.records;
    }

    async append(entry: DeadLetterEntry): Promise<void> {
        this.records.push(entry);
    }
}
