# Style Checklist — Reading Room

The rules here are also inlined at the top of `CLAUDE.md` so they're always in context.
This file is for human reference. Full rules live in `~/.claude/CLAUDE.md`.

---

## Before writing a function
- [ ] Destructure object params at the parameter site: `({ store, logger }: Deps)` not `(deps: Deps)` then `deps.store` inside
- [ ] Explicit return type on every exported function and every function in a `.utils.ts` file
- [ ] `const` only — if reaching for `let`, restructure instead (exception: `let driver` in test `beforeEach`)

## After writing a function body
- [ ] Blank line before every standalone `return` at the end of a multi-statement block
- [ ] Guard clauses at the top, happy path at the bottom — no nesting
- [ ] No `as Type` or `as any` type assertions anywhere

## JSX and event handlers
- [ ] Event handlers always named `handle*` — defined above the JSX return, never inline in props
- [ ] When a component receives an `onAction` prop, define `handleAction` inside and pass that to the element — parent passes a function reference, not a wrapper lambda

## Tests
- [ ] Driver in an adjacent `*.driver.ts` file — never inline in the test file
- [ ] Driver methods in namespaces: `given.*`, `when.*` / `get.*` / `post.*` / `patch.*` / `del.*`, `assert.*`
- [ ] Domain objects in tests always via builders: `aBook()`, `aShelf()` — never inline `{ title: '...' }`
- [ ] No assertions or DOM queries in test body — all of that lives in `driver.assert.*`

## Adapters and ports
- [ ] No technology prefix on class names (`BookRepository` not `DrizzleBookRepository`)
- [ ] Port suffix on every interface file: `book-repository.port.ts`, `store.port.ts`
- [ ] No `.command` / `.query` suffix on domain files — the directory communicates the role

## Imports
- [ ] Named exports only — no default exports (except lazy-loaded route components)
- [ ] Import order: external → internal absolute (`~`) → local relative; `.scss` last in frontend files
