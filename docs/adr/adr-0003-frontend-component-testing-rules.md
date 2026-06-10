# ADR 0003: Frontend Component Testing Rules

## Status
Accepted — 2026-06-10

## TL;DR
Component tests are triggered by three mechanical criteria (non-trivial state, a companion `.utils.ts`, or reuse across two or more parents), not by subjective complexity judgment. Any component that earns a test earns a driver, unconditionally, and DOM presence assertions (`toBeInTheDocument`) are the correct form for presence/absence decisions.

## Context
The existing global instructions contained one trigger for Vitest component tests: "non-trivial state" (optimistic updates, rollback paths, async-driven conditional renders, `useEffect` with side effects). This left two gaps: (1) a large class of components with extracted logic but no async behavior were untested with no stated reason, and (2) "non-trivial" required judgment that different engineers resolved differently. Additionally, the instructions implied drivers were only for non-trivial state components, creating two structural classes of component test with no basis for the distinction. The questions to resolve were: which components warrant a test, what form assertions should take, what a component integration test is and when to use one, and how the whole system fits the large-circle → small-circle TDD philosophy.

## Options Considered

### Option A — Keep the "non-trivial state" trigger only
- **For:** Conservative. Avoids over-testing. Simple conditional rendering based on a static prop is deterministic and covered by any feature-level Cypress test that exercises the feature. Fewer tests means less maintenance per refactor and less noise in a failing suite.
- **Against:** Leaves wide swaths of the component tree untested with no stated reason. A component that maps over items and renders different markup per status type (InProgress vs Done render different controls) has complex behavior that a Cypress failure would identify as "something in the book list is broken" — not which status case failed. Also fails to cover components with extracted utils logic, where testing only the utils unit and not the wiring is incomplete.

### Option B — "Any user-visible decision" trigger
- **For:** Comprehensive coverage. If a component makes a user-visible decision, there is a test for that decision. Removes ambiguity about which components need tests.
- **Against:** Too coarse. Includes trivially simple cases like `if (count === 0) return null` that every feature-level Cypress test exercises for free. Produces a large volume of tests for simple prop-based conditionals, increasing maintenance cost without proportional diagnostic value. The signal-to-noise problem at 2am with forty failing Vitest tests and one Cypress test that confirms the user flow is broken is real.

### Option C — Three mechanical triggers (chosen)
Triggers:
1. Non-trivial state (existing rule — kept)
2. The component has a `.utils.ts` companion file
3. The component is reused across two or more parents and contains logic of its own

- **For:** Mechanical — no judgment required at the trigger point. The `.utils.ts` trigger subsumes the "complex branching logic" case because the standing convention says to extract logic to utils before testing it; complex conditional rendering that exists without a utils file is an architectural prompt ("extract it first") not a test trigger. The reuse trigger covers the case where no single parent's test can be authoritative. Together the three triggers cover all the meaningful gaps without generating tests for trivially simple, single-parent, logic-free components.
- **Against:** Three criteria to remember instead of one. The `.utils.ts` trigger means the component test follows from an architectural decision (extract to utils) rather than from a direct test trigger — which is the correct behavior (test follows from structure) but may feel indirect to some.

## Deliberation

**Round 1 clash:** The working agent opened with Option B ("user-visible decision"). Marcus pushed back on the coarseness of this trigger — specifically that `if (count === 0) return null` is covered by any Cypress test for free, and that the signal-to-noise problem in a large failing suite is real. The working agent also raised the driver-first rule (should apply to all component tests, not just non-trivial state). Marcus agreed on driver-first unconditionally but wanted the two thresholds (when to test, how to test if you do) stated separately rather than blurred.

**Round 2 exchange:** The working agent answered Marcus's two clarifying questions. First: Cypress and Vitest are not the same scope. A component with both a Vitest test and Cypress coverage is not a "two scopes" violation — that rule prohibits two Vitest tests at the same level for the same behavior. Second: introduced the `.utils.ts` structural trigger. Marcus accepted the `.utils.ts` trigger unconditionally ("I should have seen it myself"). Marcus rejected the standalone "multiple branches defeating Cypress diagnosis" trigger as a separate criterion, arguing it is subsumed by the `.utils.ts` rule: under the existing conventions, meaningfully complex conditional branches should already be extracted to utils. If they are, the test follows from the trigger. If they aren't, the instruction to the engineer is architectural (extract first), not test-adding.

**Round 3 close:** The working agent asked for an explicit positive rule on DOM assertion style rather than a permissive statement. Marcus gave it unconditionally: `toBeInTheDocument()` / `not.toBeInTheDocument()` for presence/absence decisions, not implementation checks (render method calls, internal state inspection). Both failure modes — asserting on internal state variables, and only asserting text content while missing presence bugs — are real and avoidable with one clear rule.

Both sides agreed that the big-circle → small-circle relationship (Cypress is the outer loop defining done for a feature; Vitest component tests are the inner loop covering branches and state transitions that Cypress confirms but cannot pinpoint) needs to be stated explicitly in the instructions rather than left implicit.

## Decision

Three-trigger rule for component tests, driver unconditional, DOM presence assertion positive rule, explicit big-circle → small-circle statement. Option C won because the `.utils.ts` structural trigger eliminates judgment, subsumes the complexity case, and follows naturally from the existing architectural convention (extract logic to utils before testing). The "user-visible decision" trigger was too coarse; the existing "non-trivial state"-only trigger left too many gaps.

## Consequences / Tradeoffs

**Easier:**
- Engineers have three mechanical triggers. No judgment required at the trigger point about "is this complex enough?"
- The `.utils.ts` structural trigger means architectural conventions and test conventions reinforce each other: extracting logic to utils automatically generates the next test target.
- Driver structure is consistent across all component tests. No two-class system.
- DOM assertion style is explicit, eliminating both failure modes (implementation checking, text-only assertions).

**Harder:**
- The trigger count is three instead of one. Engineers need to internalize all three.
- The `.utils.ts` trigger means an engineer who skips extracting logic (violating the architectural convention) also silently avoids the test trigger — the two conventions depend on each other being followed.

**Knowingly accepted:**
- Simple single-parent presentational components with no extracted logic and no non-trivial state receive no Vitest component test. They remain covered by parent tests or Cypress. This is intentional and proportional.

**Reversibility:**
- Adding more triggers later (if the three prove insufficient) is cheap — additive change.
- Removing triggers (if the test volume proves too high) requires identifying which tests were written under the removed trigger and deleting them — moderate cost, not catastrophic.

## Related
- [ADR 0001](adr-0001-adr-format-one-file-per-decision.md) — ADR format
- [ADR 0002](adr-0002-benchmark-template-completeness-gates.md) — benchmark template gates (context: Vitest component test was a completeness gate)
