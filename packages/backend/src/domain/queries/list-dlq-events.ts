import { DeadLetterStorePort, DlqEventRecord } from '../ports/dead-letter-store.port.ts';

type ListDlqEventsDeps = {
    deadLetters: DeadLetterStorePort;
};

export const listDlqEvents = ({ deadLetters }: ListDlqEventsDeps): Promise<DlqEventRecord[]> => deadLetters.list();
