# Reading Room

A full-stack CRUD app demonstrating architectural and coding practices: TypeScript · Express · PostgreSQL · Drizzle · React · Axios · Cypress · Vitest · pnpm workspaces.

## Prerequisites

- Node.js 22+
- pnpm (`npm install -g pnpm`)
- Docker (for PostgreSQL)

## Quick start

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
pnpm install

# 3. Run migrations
pnpm --filter @reading-room/backend db:migrate

# 4. Start both apps (port 3000 = backend, port 5173 = frontend)
pnpm dev
```

Open http://localhost:5173.

## Development commands

| Command | What it does |
|---|---|
| `pnpm dev` | Start backend + frontend concurrently |
| `pnpm -r test` | Run all Vitest unit tests |
| `pnpm -r typecheck` | TypeScript check across all packages |
| `pnpm lint` | ESLint (0 warnings allowed) |
| `pnpm --filter @reading-room/backend test:integration` | Integration tests (requires Docker) |
| `pnpm --filter @reading-room/frontend cypress:open` | Open Cypress |
| `pnpm --filter @reading-room/frontend cypress:run` | Headless Cypress |

## Architecture

```
packages/
  common/     ← domain models, enums, DTOs — no deps on backend/frontend
  backend/    ← Express + PostgreSQL (Drizzle + Knex) — depends on common only
  frontend/   ← React + Vite + Axios — depends on common only
```

The dependency graph is strictly acyclic: `common` is the leaf. `backend` and `frontend` depend on `common` and on nothing else outside their own package. The domain layer (`backend/src/domain/`) knows nothing about Express, Postgres, or Drizzle — tested entirely with in-memory fakes.

Architectural decisions are recorded in [`docs/adr/`](docs/adr/).

## Pattern map

Navigation only — each row names the practice and points to its canonical file.

| Pattern | Canonical file |
|---|---|
| Composition root | `packages/backend/src/main.ts` |
| Ports & Adapters (port) | `packages/backend/src/domain/ports/book-repository.port.ts` |
| Ports & Adapters (adapter) | `packages/backend/src/adapters/repositories/book.repository.ts` |
| CQRS command | `packages/backend/src/domain/commands/create-book.ts` |
| CQRS query | `packages/backend/src/domain/queries/list-books.ts` |
| Outbox pattern | `packages/backend/src/domain/commands/create-book.ts` |
| Outbox relay + DLQ | `packages/backend/src/outbox-relay/outbox-relay.ts` |
| Optimistic locking | `packages/backend/src/adapters/repositories/book.repository.ts` → `updateWithToken` |
| Repository contract test | `packages/backend/src/domain/ports/book-repository.contract.ts` |
| Fake (in-memory) | `packages/backend/src/testing/fake-book-repository.ts` |
| Builder | `packages/backend/src/testing/builders/book.ts` |
| Backend driver | `packages/backend/src/domain/commands/create-book.driver.ts` |
| Validation middleware | `packages/backend/src/http/middleware/validate.middleware.ts` |
| Env config module | `packages/backend/src/config.ts` |
| RestfulWrapper | `packages/frontend/src/data/restful-wrapper.tsx` |
| Layout primitives | `packages/frontend/src/ui/box.tsx` |
| Context provider (scoped) | `packages/frontend/src/features/books/book-list-context.tsx` |
| Frontend driver (Vitest) | `packages/frontend/src/features/books/book-card.driver.tsx` |
| Frontend driver (Cypress) | `packages/frontend/cypress/support/drivers/book-list.driver.ts` |

## Not demonstrated here

These practices are part of how we work but are intentionally out of scope for this template:

- **Feature flags** — nothing is partially built here; flags guard unfinished work, so this template has none. Reach for LaunchDarkly or a Postgres-backed flag table when you need them.
- **OTel wiring** — the logger port is the swap point. The specific OTel exporter (Honeycomb, Grafana, Datadog) is environment-dependent and ripped out on day one in every real project. Wire it in `main.ts` behind `LoggerPort`.
- **Cross-service schema versioning** — this is a single deployable; schema evolution across independently deployed services (Avro, Protobuf, AsyncAPI) is not demonstrated.
- **Authentication** — no auth layer. The DLQ admin endpoint comments where auth must be added before production exposure.
- **Message broker** — the outbox relay currently logs events rather than publishing to Kafka/RabbitMQ. The `EventDispatcherPort` is the seam; swap the adapter in `main.ts`.
