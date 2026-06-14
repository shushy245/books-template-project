# Workplan: Model Folder Decomposition + Chance Builders

Outcome of the mono frontend analysis session. Implement these in order — each step is independently committable.

---

## 1. Add `Chance` to builders

**Why:** hardcoded defaults (`'book-1'`, `'Dune'`) let tests silently depend on specific values. Random defaults expose that immediately.

**What:**
- `pnpm add -D chance @types/chance` in `packages/frontend`
- Rewrite `src/testkit/builders/book.ts`: replace all hardcoded field defaults with `chance.*` calls (`chance.guid()` for ids, `chance.sentence()` for titles, etc.)
- Keep the class-based shape (private `state`, `with*` methods, factory `aBook()`); only the defaults change

---

## 2. Expand the `book` model folder

The current `src/models/book/` only has `translator.ts` + `index.ts`. Decompose it per the pattern now in global CLAUDE.md:

**What to add:**
- `model.ts` — extract `BookWireDTO` out of `translator.ts` and into `model.ts`. Export it from `index.ts`.
- `selectors.ts` — add `isRead(book): boolean`, `hasRating(book): boolean`. Wire them into `book-card.tsx` where those checks currently happen inline.
- `index.ts` — re-export from all files (`model`, `translator`, `selectors`)

**What stays in `translator.ts`:** `fromDTO`, `toCreatePayload`, `toUpdatePayload` — no change needed.

Makers and setters: nothing concrete demands them yet — skip (YAGNI).

---

## 3. Add the namespace barrel `src/models/index.ts`

**Why:** we currently have one model (`book`). Adding `shelf` or `author` model folders will create ambiguous bare `fromDTO` exports immediately. Set the pattern before the collision.

**What:**
```ts
// src/models/index.ts
import * as bookModel from './book';
export { bookModel };
```

Update call sites: anywhere that imports directly from `~/models/book` should import `{ bookModel }` from `~/models` instead and call `bookModel.fromDTO(...)`, `bookModel.fromPayload(...)`, etc.

---

## 4. Add `author` and `shelf` model folders (if S8+ adds those entities)

Once new entities appear, create their folders following the same decomposition. The namespace barrel from step 3 makes the extension trivial.

---

## Notes

- Steps 1–3 are pure refactors — no behaviour change, all tests stay green.
- Step 1 can land alone; steps 2–3 should land together (moving `BookWireDTO` without updating the barrel would break imports).
- The `pathgen` test-ID upgrade (replacing manual `as const` objects) is a separate, lower-priority cleanup — not in this workplan.
