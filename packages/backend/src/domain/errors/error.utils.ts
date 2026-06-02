import { EntityKind } from '@reading-room/common';

export const notFoundMessage = (op: string, kind: EntityKind, id: string): string =>
    `${op}: ${kind} not found — id=${id}`;

export const conflictMessage = (op: string, id: string, storedAt: Date): string =>
    `${op}: optimistic lock conflict — id=${id}, storedAt=${storedAt.toISOString()}`;
