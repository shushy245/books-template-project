import { ReadingStatus } from '../enums/reading-status.js';

export type UpdateBookDto = {
    id: string;
    updatedAt: Date; // optimistic lock token — must match the stored value
    status?: ReadingStatus;
    rating?: number;
};
