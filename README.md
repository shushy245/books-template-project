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
pnpm --filter @reading-room/backend migrate

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

See [plan](../.claude/plans/show-me-an-implementation-wild-forest.md) for the full story/task/subtask breakdown and ADRs.
