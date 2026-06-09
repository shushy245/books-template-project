import { ReadingStatus } from '../enums/reading-status.ts';

export type CreateBookDto = {
    title: string;
    authorId: string;
    shelfId: string;
    status: ReadingStatus;
};
