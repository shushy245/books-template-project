import { randomUUID } from 'crypto';

import { DeadLetterEntry, DeadLetterStorePort, DlqEventRecord } from '../domain/ports/dead-letter-store.port.ts';

export class FakeDeadLetterStore implements DeadLetterStorePort {
    private readonly records: DeadLetterEntry[] = [];

    get entries(): DeadLetterEntry[] {
        return this.records;
    }

    async append(entry: DeadLetterEntry): Promise<void> {
        this.records.push(entry);
    }

    async list(): Promise<DlqEventRecord[]> {
        return this.records.map((entry) => ({ ...entry, id: randomUUID(), createdAt: new Date() }));
    }
}
