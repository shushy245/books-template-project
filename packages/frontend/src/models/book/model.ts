import { Book } from '@reading-room/common';

// Wire shape from the API — JSON serialization produces ISO strings, not Date objects
export type BookWireDTO = Omit<Book, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
};
