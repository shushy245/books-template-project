# Reading Room — Project Instructions

## Session discipline

**Read `docs/style-checklist.md` before starting each story.** The global `~/.claude/CLAUDE.md`
compresses out of active context over a long session; the checklist is short enough to survive.

**Run `/code-review` after each story, before committing.** Catches style drift before it
accumulates. Use `medium` effort — `high` for stories touching multiple layers.

**One story per session.** When the context grows long enough that style drift starts appearing,
start a new session rather than trying to correct inline. Corrections cost context too.

## Project overview

Monorepo — three packages:

- `packages/common` — shared TypeScript types: models, DTOs, enums. No runtime logic.
- `packages/backend` — Express API, Drizzle ORM, PostgreSQL, domain commands and queries.
- `packages/frontend` — React 18, Vite, Axios, custom layout primitives.

## Architecture

- **Ports & Adapters** — domain layer depends only on `.port.ts` interfaces; adapters live in
  `adapters/`. `StorePort` is the single database access object injected into commands/handlers.
- **CQRS** — writes in `domain/commands/`, reads in `domain/queries/`. Each is a plain function.
- **Outbox pattern** — `createBook` writes book + outbox event atomically via `store.transaction()`.
- **Optimistic locking** — `updateWithToken` takes `updatedAt` as the lock token; returns 409 on conflict.

## Key conventions (project-specific)

- `StorePort` has `books`, `shelves`, and `transaction()`. Outbox is only accessible inside a transaction.
- Error HTTP mapping lives in `http/http-error.utils.ts`: NotFoundError→404, ConflictError→409, RuleError→422.
- `BookRepository` contract tests in `domain/ports/book-repository.contract.ts` run against both
  `FakeBookRepository` and `DrizzleBookRepository`. Add new repo behaviour there first.
- Test builders live in `testing/builders/`: `aBook()`, `aShelf()`. Add new ones as new domain
  objects appear in tests.

## What's done

- S1–S3: Setup, common package, full persistence layer (Drizzle, schema, migrations, contract tests)
- S4: `listBooks` query + `GET /api/books` + frontend browse UI + Cypress E2E
- S5: `createBook` command with outbox pattern + integration test
- S6: `updateBook` command (status transitions, rating, optimistic locking) + `PATCH /api/books/:id` + optimistic UI

## What's next

- **S7:** Delete book — `deleteBook` command, `DELETE /api/books/:id`, remove card from UI
- **S8:** Outbox relay — background worker that polls unprocessed outbox events (scope to confirm)
