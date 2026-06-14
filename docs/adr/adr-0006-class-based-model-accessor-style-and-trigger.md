# ADR 0006: Class-Based Domain Model Accessor Style and Class-Adoption Trigger

## Status
Accepted — 2026-06-14

## TL;DR
Keep `Book` (and other currently-flat models) as plain TypeScript type aliases with domain rules in pure functions. When a model earns a class — when there is private state callers must not bypass, or lifecycle invariants the entity must enforce itself — expose data via TypeScript getter properties and derived logic via explicit methods. The adoption trigger matters as much as the accessor style.

## Context
The deliberation started as a style question: should class-based domain models use `private` fields with explicit accessor methods (`book.author()`) or public fields (`book.author`)? The project is a TypeScript monorepo where `Book`, `Author`, and `Shelf` are currently plain type aliases. Domain logic for `Book` (`canTransition`, `canRate`) already lives as pure functions in `book-rules.ts`, following the functional-core pattern. Nesting (Author objects, Shelf membership) was described as "coming soon." A global coding-standards example (`NotificationSettingsModel` with `recurringTimes()` and `hasRecipients()`) was initially cited as an existing in-codebase precedent, but it is a canonical illustration in the global `CLAUDE.md`, not an actual model in this project.

The question of *how* to write class accessors is inseparable from the question of *when* a model should become a class at all.

## Options Considered

### Option A — All private, accessor methods for everything (`book.author()`)
- **For:** Abstraction boundary is explicit; internal representation can change without breaking callers; consistent rule with no per-field judgment.
- **Against:** Call site `book.author()` signals computation or side effects — misleads readers when the method is a plain passthrough. `()` carries semantic weight in TypeScript that should not be wasted on data properties. Uniform accessor methods create noise when the model has no real behavior.

### Option B — Public readonly fields for flat data
- **For:** Idiomatic for plain data; no ceremony; obvious call site.
- **Against:** Exposes internal representation to all callers; a rename or structural change breaks every access site; no path to encapsulate behavior incrementally without a breaking API change.

### Option C — TypeScript getter properties for data, explicit methods for derived/computed values (selected)
- **For:** Getter `get author(): string { return this._data.author; }` gives the same encapsulation boundary as a method — internal shape can change without touching callers — while keeping call site `book.author`, which reads as data. The `()` is reserved for methods that compute or derive something. No false binary between "method" and "public field."
- **Against:** Slight asymmetry: some access looks like property access, some looks like method calls. In practice this maps cleanly to "data vs. derived logic," which is a meaningful semantic distinction.

### Option D — Keep as type alias with functional selectors (where models don't yet warrant a class)
- **For:** Honest about the current complexity level. Domain rules already live cleanly as pure functions (`canTransition`, `canRate` in `book-rules.ts`). No private state to encapsulate, no invariants the entity needs to enforce itself. Functional-core pattern is working. TypeScript structural typing makes type-alias → class migration mechanical when the need is real.
- **Against:** Nothing, given the current reality. The hesitation is that "nesting is coming soon" was cited as justification — but that is anticipation, not a scoped story.

## Deliberation

The working agent opened with Option A: all private with methods, justified by (1) abstraction boundary, (2) nesting coming soon, (3) consistency with `NotificationSettingsModel` in the codebase.

Marcus Reid identified three problems before committing:

1. **False binary.** The debate framed the choice as method (`book.author()`) vs. public field (`book.author`), ignoring TypeScript getter properties — which give the abstraction boundary of a method while keeping property-access ergonomics. The working agent accepted this as genuinely moving: getters dissolve the tension between encapsulation and ergonomics.

2. **Misread precedent.** The working agent cited `NotificationSettingsModel` as establishing a codebase convention. Marcus probed: those methods (`hasRecipients()`, `recurringTimes()`) do computation and traverse nested optionals — they are not plain passthroughs. The working agent confirmed that `NotificationSettingsModel` is a canonical example in the global `CLAUDE.md`, not an implemented model in this project. The consistency argument collapsed.

3. **The class is premature.** Marcus pivoted to the deeper question: does `Book` warrant a class at all? Eight scalar fields, domain logic already in pure functions, no private state, no invariant that the entity must enforce itself. "Nesting is coming soon" was the working agent's justification. Marcus called it exactly: that is YAGNI. The next scoped story (S8: outbox relay worker) has nothing to do with Author objects or structural nesting. The cost of migrating a type alias to a class when the need is real is bounded and mechanical. The working agent conceded this fully.

**What was held:** Both sides agreed on Option C as the right accessor convention for when a class is written. Neither side held a position that needed to be overcome — this part converged cleanly.

**What was conceded:** The working agent conceded (1) the false binary on getters (R2), (2) the misread precedent (R2), and (3) the premature class argument (R3). Marcus conceded nothing substantive — his objections were upheld at each round.

**Marcus's most important addition:** The ADR should center on the WHEN criterion, not just the HOW. The criterion: a class earns its place when you have **private state that callers must not directly bypass**, or **lifecycle invariants that the entity must enforce itself** — not "nesting is anticipated," not "internal representation might change," not "the model feels domain-rich." When you need "this entity validates its own state transitions regardless of which caller or context is involved," that is the trigger. Not before.

Marcus also flagged: capture the near-miss. The working agent was about to wrap a flat data type in a class because of anticipated nesting and a global-standards example cited as local precedent. That near-miss is the most instructive part of this decision for future engineers.

## Decision

1. **Keep `Book`, `Author`, and `Shelf` as plain TypeScript type aliases.** Domain rules stay as pure functions (`book-rules.ts`). No class wrapper until the trigger fires.

2. **The class-adoption trigger:** A model earns a class when it has **(a) private state that callers must not touch directly** or **(b) lifecycle invariants the entity must enforce itself** — conditions where "a pure function that callers may or may not call" is not strong enough. "Nesting is coming," "internal representation might change," and "it feels like a domain object" are not triggers.

3. **When a class is written:** Private `data` field, **TypeScript getter properties for simple data access** (`get title(): string { return this._data.title; }`), **explicit methods for computed/derived values** (`hasRecipients()`, `canRate()`). The `()` is semantically reserved for computation, not passthrough data.

## Consequences / Tradeoffs

**What becomes easier:**
- No class overhead until there is behavior to justify it — model files remain minimal and readable.
- When a class is introduced, the convention is unambiguous: getters for data, methods for logic. No per-field judgment.
- Getter-based access is refactor-transparent: if `book.title` later becomes `book.get title() { return this._data.content.heading; }`, no call site changes.

**What becomes harder:**
- Engineers familiar with `class Book { readonly title: string }` (public field style) may find the "no public fields, use getters" rule slightly surprising. The ADR is the explanation.
- The WHEN trigger requires judgment — "private state callers must not bypass" is a meaningful criterion but not a mechanical rule. Engineers who learned the rule without understanding the reasoning may apply it inconsistently.

**What is knowingly accepted:**
- Some future model will arrive and the WHEN question will be re-evaluated. This is correct behavior — it means the trigger is being applied to a real case rather than anticipated ones.
- The asymmetry between getter access and method access (`book.title` vs `book.hasRecipients()`) is intentional. It is a semantic signal, not a style inconsistency.

**Reversibility:**
- Type alias → class: mechanical in TypeScript (structural typing). Low cost.
- Class with getters → public fields: breaking change for callers who relied on the encapsulation. Medium cost.
- The chosen path (type alias now, class when earned) is the most reversible starting point.

## Related
- `docs/adr/adr-0001-adr-format-one-file-per-decision.md` — established the ADR format and the "consistency with surrounding philosophy" principle
- Global `CLAUDE.md` — "Class Models for Rich Domain Logic" section; the `NotificationSettingsModel` example that informed (and was re-examined during) this deliberation
