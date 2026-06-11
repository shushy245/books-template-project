# ADR 0005: Outbox Over Dual-Write for Event Publishing

## Status
Accepted — 2026-06-11

## TL;DR
`createBook` writes the `Book` row and the `OutboxRecord` in a single database transaction. A background relay then polls and dispatches. Dual-write (write to DB, then publish to broker separately) is not a viable alternative — it is a correctness violation that cannot be fixed at the application layer.

## Context
`createBook` must do two things: persist a `Book` row and emit a `BookCreated` event so downstream consumers can react. Two approaches exist for combining these operations. Choosing the wrong one produces a system that appears to work under normal conditions but silently loses events on any failure between the write and the publish.

## Options Considered

### Option A — Dual-write
Write the `Book` to the database, then publish the `BookCreated` event to the broker.

- **For:** simple; no relay process; event reaches consumers with push latency
- **Against:** not atomic. If the process crashes after the DB write but before the publish, the book exists but no event was ever emitted. The downstream never learns the book was created. There is no application-layer fix for this — you cannot detect the gap without external coordination, and retrying the publish risks duplicate events if the first publish actually succeeded. This is the dual-write problem, and it produces permanent split-brain on any partial failure.

### Option B — Outbox pattern
Write `Book` + `OutboxRecord` atomically in a single DB transaction. A relay process polls `outbox` for unprocessed records and dispatches them. On successful dispatch, the record is marked processed; on repeated failure it is dead-lettered.

- **For:** atomicity is guaranteed by the DB transaction — either both writes commit or neither does. No gap between "book exists" and "event will be dispatched." Dead-letter tracking makes failures visible and recoverable.
- **Against:** relay is a required process (ops burden — it must run alongside the server); events are delivered with polling latency rather than push; at-least-once delivery means consumers must be idempotent.

## Decision

Outbox. Dual-write is not a tradeoff — it is a correctness violation. The at-least-once / polling-latency costs of the outbox are real but bounded and manageable. The split-brain risk of dual-write is unbounded and undetectable without external tooling.

The implementation: `createBook` calls `store.transaction()`, which opens a single Postgres transaction and provides access to both `books` and `outbox` repositories. Both writes happen inside that transaction. The relay runs on a configurable interval (`OUTBOX_RELAY_INTERVAL_MS`), dispatches events via `EventDispatcherPort`, and writes failed events to `dlq_events` after exhausting retries.

## Consequences

**What becomes easier:**
- Guaranteed at-least-once delivery — the book row and the outbox record are always in sync; there is no window where the book exists but the event does not
- Failures are visible — the DLQ table and relay logs make stuck or dead events observable and recoverable
- The dispatcher is swappable — `EventDispatcherPort` is the seam; the `LoggingEventDispatcher` (current) is replaced by a Kafka or RabbitMQ adapter by changing one line in `main.ts`

**What becomes harder:**
- The relay is a required process — it must be started alongside the server and monitored in production
- Events carry polling latency — the relay's `intervalMs` controls the worst-case delay between write and dispatch
- Consumers must be idempotent — at-least-once delivery means the same event can arrive more than once (network retries, relay restarts); consumers that are not idempotent will produce duplicate side effects

## Related
- [ADR 0002: Benchmark Template Completeness Gates](adr-0002-benchmark-template-completeness-gates.md)
