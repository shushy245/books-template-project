import { Book, ReadingStatus } from '@reading-room/common';

export const isRead = (book: Book): boolean => book.status === ReadingStatus.Read;
export const hasRating = (book: Book): boolean => book.rating !== undefined;
