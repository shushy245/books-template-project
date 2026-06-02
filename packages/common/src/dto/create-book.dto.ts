import { ReadingStatus } from '../enums/reading-status.js';

export type CreateBookDto = {
    title: string;
    authorId: string;
    shelfId: string;
    status: ReadingStatus;
};
