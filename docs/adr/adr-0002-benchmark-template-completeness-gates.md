# ADR 0002: Benchmark Template Completeness Gates

## Status
Accepted — 2026-06-09

## TL;DR
A benchmark template is complete only when every declared practice has a worked example and nothing it ships actively miseducates; eight gates were identified for this project, framed as per-pattern blockers rather than a priority backlog.

## Context
The "Reading Room" project was built to serve as the team's benchmark reference — the artifact engineers copy from and point "how do we do X here" questions at. After S1–S8 (setup through outbox relay), the question was raised: is the project complete enough for that role? The evaluation criteria matter as much as the individual gaps, because the wrong frame leads to wrong completeness calls.

The tension: a production system's backlog uses priority. A template's completeness uses a different measure — does it demonstrate everything it declares, and does it demonstrate nothing wrongly? Ranking items as "more or less urgent" obscures that distinction.

## Options Considered

### Option A — Priority-ordered backlog
Rank all gaps and ship fixes in order.

- **For:** familiar frame; addresses the most harmful things first; always shippable
- **Against:** conflates miseducation (actively harmful) with undemonstrated practice (gap); allows a template to ship with declared practices missing if they rank low enough; readers interpret the template as *the canonical set*, so silent absences become implicit team policy

### Option B — Per-pattern gates with severity classification
For each declared practice: is it demonstrated correctly, demonstrated wrongly, or not demonstrated? Each gate is binary (pass/fail). Severity classifies how bad the failure is, not when to fix it.

Three severity tiers:
- **Miseducation** — present and wrong; copying it propagates harm
- **Undemonstrated declared practice** — absent; the template fails to model something it mandates; team improvises inconsistently
- **Cosmetic / relabeling** — wrong framing but no substantive harm; lowest priority, non-blocking

- **For:** maps directly to the template's actual job; prevents "completed" from meaning "the important items"; makes clear why navigability and substantive ADRs are gates, not nice-to-haves
- **Against:** requires a full sweep (you have to prove the list is complete, not just that the items found are correctly classified); slightly more effort upfront

## Deliberation

The working agent opened with a three-tier priority list: (1) CI, env config, and missing component tests as blocking; (2) logger stub and generateUniqueId as secondary. Marcus challenged the frame immediately — a priority list is the right tool for a production backlog, not for a template's completeness gate. A template's authority comes from embodying its own rules; a template that violates a rule it ships is self-refuting.

**On env config:** Both sides agreed it belongs at the top, but for different reasons. The working agent cited principle consistency ("validate at every boundary"). Marcus sharpened to the more operationally dangerous consequence: the `?? 'default'` fallback pattern actively miseducates — engineers copy it, ship a service that boots happily on a missing `DATABASE_URL`, and don't discover it until 2am when the service appears to work but is talking to the wrong thing. This is the worst failure class a template can have.

**On the logger:** The working agent initially classified the `console.log(JSON.stringify(...))` implementation as a gap requiring a real OTel adapter. Marcus pushed back: the teachable artifact is `LoggerPort` + the composition root wiring it, not the OTel specifics. OTel is environment-dependent (which collector, which backend — Honeycomb vs Datadog vs Grafana), and bolting it into a template means every team rips it out on day one. The console JSON adapter behind a clean port is the correct template artifact. The working agent conceded; the only fix needed is relabeling the `// TODO` comment to read "this is the swap point for your OTel exporter" rather than implying it's unfinished work.

**On generateUniqueId:** The working agent argued the Rule of Three had fired — `randomUUID()` appears in three test fakes, so it should be wrapped. Marcus rejected this: the Rule of Three fires on duplicated *knowledge*, not on a duplicated *call shape*. `randomUUID()` is a stdlib call with no realistic migration risk and no edge to fix; and these are *test fakes* generating placeholder identity, not production code crossing a trust boundary. The wrapping rationale in the standard is "migration risk" — which doesn't apply here. Dropped from the list.

**On ADRs:** The working agent didn't flag this as a gap initially. Marcus introduced it: only one ADR exists (`adr-0001`), a meta-ADR about the format itself. No substantive domain decision ADRs. "Documentation of decisions, not implementations" is a declared practice; a template that omits it teaches its absence as policy. The working agent agreed this is a gate of the same class as the component test. Number of ADRs: Marcus asked for two; the working agent pushed back that a second synthetic ADR would itself be the kind of scaffolding the standard rejects. Marcus conceded: one genuine ADR demonstrating the practice is sufficient, as long as it's a genuinely contestable decision (i.e., the Consequences section earns its keep).

**On DLQ:** The write side (logging at death, atomic `dlq_event` insert, delivery count tracking) is correct. The read side — a consumer that gives operators visibility into what died and a seam for manual replay — is absent. The standard is explicit: "a dead queue nobody reads is a silent black hole." The working agent scoped the fix to a minimal `GET /api/admin/dlq` endpoint (~30 lines). Marcus added two constraints: (1) include a note about operator auth, because the default template pattern would be an unauthenticated endpoint exposing dead-letter contents; (2) explicitly mark the replay seam — "replay would hook in here" — so the template doesn't teach "DLQ = a table you can read" and silently drop the recovery half of the contract.

**On CI:** Both agreed CI is blocking. Marcus sharpened: Cypress must be *actually green* in CI, not defined-but-skipped. The classic failure is an integration job that quietly runs `skip` because nobody wanted to stand up a Postgres service container in the runner. Marcus extended this to the integration test suite too: those run against real Postgres and catch SQL edge cases, constraint violations, and migration drift — the highest-ROI test layer. If the service container setup is a yak-shave, that's exactly the thing the template should solve once.

**New gap introduced — "Not demonstrated here" README section:** Marcus added this in the final round. A benchmark template gets read as *the canonical set*, and every practice that's absent gets silently read as "not part of how we work." An explicit list of what's out of scope and why converts silence into a stated boundary: feature flags (nothing half-built to guard), OTel wiring (environment-specific), cross-service schema versioning (single deployable). Fifteen lines that make the template honest about its edges rather than appearing comprehensive when it isn't.

## Decision

Template completeness is assessed via per-pattern gates, not a priority backlog. The following eight gates must pass before the project serves as the benchmark reference:

1. **Env config** — Zod-validated config module; `.parse()` at startup; crashes loudly on missing required vars; replaces all `process.env['X'] ?? 'default'` patterns
2. **CI** — GitHub Actions running lint + typecheck + unit tests + integration tests (with real Postgres service container) + Cypress E2E; every layer must be actually green, not defined-but-skipped
3. **DLQ read endpoint** — minimal `GET /api/admin/dlq` backed by `listDlqEvents` query; comment noting operator auth requirement in production; explicit marker naming the replay seam
4. **Pattern map** — README table: `Pattern → canonical file`; navigation only, no prose explanations (prose drifts and becomes a DRY violation against the code)
5. **One Vitest component test** — `BookCard` (has optimistic update + rollback); driver in jsdom with testing-library; demonstrates the component-testing move in the richest available example
6. **One substantive ADR** — a genuinely contestable architectural decision (outbox over dual-write is the natural candidate); the Consequences section must earn its keep
7. **Logger TODO comment** — relabeled to "this is the swap point for your OTel exporter; the port is the contract"
8. **"Not demonstrated here" README section** — explicit list of what's out of scope and why; prevents template absence from reading as team policy

Items explicitly confirmed as non-gaps: `RestfulWrapper` (present and in use), pagination (built from day one), frontend 409 rollback (present in `BookCard`), outbox relay (fully built and operational), `generateUniqueId` wrapping in test fakes (test scaffolding, not trust-boundary code).

## Consequences / Tradeoffs

**What becomes easier:**
- New engineers have a navigable reference that explicitly states where each practice lives and what it intentionally omits
- Template gaps are visible rather than implicit — "we don't use feature flags" becomes a documented boundary, not an accident
- CI catching real failures (integration + Cypress) means the template's "trunk-based, commit to master" posture has its actual safety net

**What becomes harder:**
- Cypress in CI has non-trivial setup (service containers, seeding, potential flakiness) — this must be solved correctly, not papered over
- The ADR demonstrates the practice but also sets the bar for future ADRs — every significant decision made in template-derived projects will be measured against this example

**Reversibility:**
Low cost. Every gate is additive. None of the fixes touch the domain layer, existing tests, or the architectural skeleton. The logger comment and the README sections are trivially reversible. The Cypress CI job and the env config module are the most substantial additions; neither touches the domain.

## Related
- [ADR 0001: ADR format — one file per decision](adr-0001-adr-format-one-file-per-decision.md)
