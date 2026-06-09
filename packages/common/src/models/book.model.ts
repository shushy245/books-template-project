import { ReadingStatus } from '../enums/reading-status.ts';

export type Book = {
    id: string;
    title: string;
    authorId: string;
    shelfId: string;
    status: ReadingStatus;
    rating?: number; // 1–5; only meaningful when status is Read
    createdAt: Date;
    updatedAt: Date;
};
