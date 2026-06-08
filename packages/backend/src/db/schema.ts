import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const authors = pgTable('authors', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const shelves = pgTable('shelves', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const books = pgTable('books', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    authorId: uuid('author_id')
        .notNull()
        .references(() => authors.id),
    shelfId: uuid('shelf_id')
        .notNull()
        .references(() => shelves.id),
    // Stored as text; ReadingStatus enum enforced at the application layer.
    status: text('status').notNull(),
    // 1–5; null when the book has not been rated.
    rating: integer('rating'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const outbox = pgTable('outbox', {
    id: uuid('id').primaryKey().defaultRandom(),
    aggregateId: text('aggregate_id').notNull(),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    // Incremented on every failed dispatch; the relay dead-letters once it hits the retry limit.
    deliveryCount: integer('delivery_count').notNull().default(0),
    // Null until the relay processes the event (dispatched successfully, or dead-lettered).
    processedAt: timestamp('processed_at'),
});

// Parked copy of an event the relay gave up on after exhausting its retries.
// Source of truth for monitoring and deliberate, operator-driven replay.
export const dlqEvents = pgTable('dlq_event', {
    id: uuid('id').primaryKey().defaultRandom(),
    outboxId: uuid('outbox_id').notNull(),
    aggregateId: text('aggregate_id').notNull(),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull(),
    deliveryCount: integer('delivery_count').notNull(),
    error: text('error').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
