import { Book, CreateBookDto, ReadingStatus } from '@reading-room/common';

import { BookWireDTO } from './model.ts';

export const fromDTO = (dto: BookWireDTO): Book => ({
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
});

export const toCreatePayload = (dto: CreateBookDto): CreateBookDto => ({ ...dto, title: dto.title.trim() });

export const toUpdatePayload = (
    book: Book,
    update: { status?: ReadingStatus; rating?: number },
): Record<string, unknown> => {
    const body: Record<string, unknown> = { updatedAt: book.updatedAt.toISOString() };
    if (update.status !== undefined) body['status'] = update.status;
    if (update.rating !== undefined) body['rating'] = update.rating;

    return body;
};
