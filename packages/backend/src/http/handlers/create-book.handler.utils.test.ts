import { describe, it } from 'vitest';

import { ReadingStatus } from '@reading-room/common';

import { ParseCreateBookDriver, makeParseCreateBookDriver } from './create-book.handler.utils.driver.js';

describe('parseCreateBookBody', () => {
    const driver: ParseCreateBookDriver = makeParseCreateBookDriver();

    const validBody = {
        title: 'Dune',
        authorId: '11111111-1111-4111-8111-111111111111',
        shelfId: '22222222-2222-4222-8222-222222222222',
        status: ReadingStatus.WantToRead,
    };

    it('parses a fully valid body', () => {
        driver.assert.bodyParsed(validBody, validBody);
    });

    it('rejects an empty title', () => {
        driver.assert.bodyRejects({ ...validBody, title: '' });
    });

    it('rejects a non-uuid authorId', () => {
        driver.assert.bodyRejects({ ...validBody, authorId: 'not-a-uuid' });
    });

    it('rejects a non-uuid shelfId', () => {
        driver.assert.bodyRejects({ ...validBody, shelfId: 'not-a-uuid' });
    });

    it('rejects an invalid status', () => {
        driver.assert.bodyRejects({ ...validBody, status: 'NotAStatus' });
    });

    it('rejects a missing title', () => {
        driver.assert.bodyRejects({ authorId: validBody.authorId, shelfId: validBody.shelfId, status: validBody.status });
    });
});
