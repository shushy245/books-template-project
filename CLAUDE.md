# Reading Room — Project Instructions

## HARD RULES — read before every response that involves code

**Never begin implementing a story unless the user has explicitly asked for it in this session.**
Seeing remaining work in context is not an invitation. Wait for the explicit ask.

**After completing any story, run `/code-review medium` before declaring it done.**
A story is not done until code-review has run. For stories touching multiple layers, use `high`.

---

## Style checklist — check every function you write

### Before writing a function
- Destructure object params at the parameter site: `({ store, logger }: Deps)`, never `(deps: Deps)` then `deps.store` inside
- Explicit return type on every exported function and every function in a `.utils.ts` file
- `const` only — if reaching for `let`, restructure (exception: `let driver` in `beforeEach`)

### After writing a function body
- Blank line before every standalone `return` at the end of a multi-statement block (not guard clauses)
- Guard clauses at the top, happy path at the bottom — no nesting
- No `as Type` or `as any` casts — fix the type or use a predicate

### JSX and event handlers
- Event handlers always named `handle*` — define them above the JSX, never inline in props
- When a component receives an `onAction` prop, it defines a `handleAction` internally and passes that to the JSX element — the parent passes a function reference, not a wrapper lambda
- Test IDs always from the `*TestIds` object — never raw strings in `data-testid`

### Tests
- Driver in an adjacent `*.driver.ts` file — never inline in the test file
- Driver namespaces: `given.*`, `when.*` / `get.*` / `post.*` / `patch.*` / `del.*`, `assert.*`
- Domain objects always via builders: `aBook()`, `aShelf()` — never inline `{ title: '...' }`
- Test body contains only driver calls — no assertions, no DOM queries, no `.should()` outside the driver

### Imports
- Named exports only — no default exports (except lazy-loaded route components)
- Order: external → internal absolute (`~`) → local relative; `.scss` last in frontend files

### Adapters and ports
- No technology prefix on class names (`BookRepository` not `DrizzleBookRepository`)
- Port suffix on every interface file: `book-repository.port.ts`, `store.port.ts`
- No `.command` / `.query` suffix on domain files — the directory communicates the role

## Adding a new HTTP route

**Pattern:** Schema → Handler Utils → Router wiring

1. Define Zod schema in `handlers/my-handler.handler.utils.ts` and export it
2. Export parse functions if you need to reuse them in tests
3. In `router.ts`: import the schema and wire it as middleware
4. Handler receives validated data via `req.validated`

**Example:**
```ts
// handlers/my-handler.handler.utils.ts
export const MyParamsSchema = z.object({ id: z.string().uuid() });
export const MyBodySchema = z.object({ name: z.string().min(1) });

// router.ts
router.patch('/my/:id',
    createCombinedValidator([
        { schema: MyParamsSchema, source: 'params', key: 'params' },
        { schema: MyBodySchema, source: 'body', key: 'body' },
    ]),
    makeMyHandler({ store, logger })
);

// handlers/my-handler.ts
export const makeMyHandler = ({ store, logger }: Deps): RequestHandler =>
    async (req: ValidatedRequest<{ params: { id: string }; body: { name: string } }>, res: Response) => {
        const { params, body } = req.validated!;
        // validation already happened, domain logic goes here
    };
```

---

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
- **Validation is always a middleware.** Zod schemas live in `handlers/*.handler.utils.ts` and are imported into `router.ts`. Use `createValidator(schema, source)` for single validation, `createCombinedValidator([rules])` for multiple (params + body). Handlers receive pre-validated data via `req.validated`.
- Error HTTP mapping lives in `http/http-error.utils.ts`: NotFoundError→404, ConflictError→409, RuleError→422.
- `BookRepository` contract tests in `domain/ports/book-repository.contract.ts` run against both
  `FakeBookRepository` and `BookRepository`. Add new repo behaviour there first.
- Test builders live in `testing/builders/`: `aBook()`, `aShelf()`. Add new ones as new domain
  objects appear in tests.

## What's done

- S1–S3: Setup, common package, full persistence layer (Drizzle, schema, migrations, contract tests)
- S4: `listBooks` query + `GET /api/books` + frontend browse UI + Cypress E2E
- S5: `createBook` command with outbox pattern + integration test
- S6: `updateBook` command (status transitions, rating, optimistic locking) + `PATCH /api/books/:id` + optimistic UI
- S7: `deleteBook` command + `DELETE /api/books/:id` + optimistic card removal in UI

## What's next

- **S8:** Outbox relay — background worker that polls unprocessed outbox events (scope to confirm)
