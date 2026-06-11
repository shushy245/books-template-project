# ADR 0004: Command Endpoint Response Shape

## Status
Accepted — 2026-06-10

## TL;DR
Command endpoints (POST/PATCH/DELETE) return only server-generated fields the client cannot derive — `{ id, createdAt, updatedAt }` on create, `{ updatedAt }` on update, 204 on delete — not the full resource. This is CQS-coherent, eliminates a backend re-fetch that assembles no new information for the client, and is load-bearing only while the first-party-only / optimistic-update assumptions hold.

## Context
The project has three established conventions that interact with this question:

1. **Optimistic updates**: the frontend applies changes locally immediately and never reads back after a write. On success it only needs the server-assigned lock token; on rejection it rolls back.
2. **Optimistic locking via `updatedAt` tokens**: the client must hold the current `updatedAt` to make the next write. The server returns a new token on every mutation. Without it, consecutive edits break.
3. **CQS as a core principle**: commands cause effects and return nothing (or a minimal success signal); queries return data with no effects.

A fourth convention — "no envelope wrapping, return the resource directly" — was written to govern query responses and had not been examined against command endpoints. It was ambiguous enough to read as "return the full resource on every endpoint," which would directly conflict with the CQS reading.

The question: given these constraints, should command endpoints return the full resource (mainstream REST, Stripe/GitHub style) or only the execution metadata the client cannot derive?

This decision sets the response contract for every write endpoint across all projects going forward.

## Options Considered

### Option A — Metadata-only (CQS-aligned)
Return only what the client cannot derive from what it sent:
- `POST /resource` → `201 { id, createdAt, updatedAt }`
- `PATCH /resource/:id` → `200 { updatedAt }`
- `DELETE /resource/:id` → `204 (no body)`

The invariant: **all fields the server generates that the client cannot predict**.

- **For:**
  - CQS-coherent: commands cause effects and return execution signals, not re-fetched domain data
  - The client already has everything it sent; returning it back is redundant bytes
  - Backend avoids a read-after-write to assemble the full resource
  - Position A → B (adding fields) is a non-breaking API expansion; B → A is a breaking contraction — starting minimal preserves more optionality
  - In this domain, the "all server-generated fields" invariant is mechanical and stable: only timestamps and IDs are server-derived; no slug generation, no title normalization, no status derivation from related entities
  - The current optimistic update implementation does not reconcile from the response on success — it consumes only `updatedAt` to update the lock token. Position B's reconciliation benefit is genuinely zero-value for this consumer.
- **Against:**
  - Non-mainstream: Stripe, GitHub, and most public REST APIs return the full resource; a second consumer added later will assume mainstream behavior
  - If the domain gains server-side enrichments (computed fields the client can't predict), the invariant widens asymmetrically across endpoints — fragmentation risk
  - Requires the documented "return the resource directly" convention to be updated and scoped explicitly to queries, or a new engineer adding a command endpoint will follow the wrong convention

### Option B — Full resource (mainstream REST)
Return the full created/updated resource:
- `POST /resource` → `201 { ...full entity }` + `Location` header
- `PATCH /resource/:id` → `200 { ...full entity }`
- `DELETE /resource/:id` → `204 (no body)`

- **For:**
  - Industry default: every Stripe/GitHub-style public API consumer will expect this
  - Server-side enrichments reach the client automatically without a follow-up GET
  - One response shape for command and query endpoints reduces the number of things engineers need to remember
  - Safe if the API ever gains a second consumer: no consumer needs to understand optimistic-update discipline to work correctly
- **Against:**
  - Backend must re-fetch or re-assemble the full resource after writing — a CQS violation at the implementation seam even when invisible from outside
  - The current optimistic update implementation doesn't use the full resource response — it consumes only `updatedAt`. Every other field in the response body is bytes nobody reads.
  - "Return the resource directly" as a blanket convention for all endpoints makes the command endpoint a de facto GET bundled with a write — the design principle is undermined in practice
  - The reconciliation benefit is theoretical for this consumer, not real

## Deliberation

The working agent opened in favor of Position A, citing CQS coherence, the optimistic-update architecture already in place, and the reversibility asymmetry (A → B non-breaking; B → A breaking). It also argued that server-enrichment widening the metadata response is preferable to returning the full resource because the "all server-generated fields" invariant remains mechanical.

Marcus Reid accepted the reversibility argument and the CQS framing in spirit (distinguishing CQS at the domain layer from CQS at the HTTP transport layer, which is softer). His primary pushback was on fragmentation: in his experience, "metadata-only" erodes under pressure into five different command endpoints each quietly returning a different subset of fields, with no invariant and no way to know what a command returns without reading the handler. He argued that full resource has one clear invariant — "command responses look like query responses" — which survives team turnover and time pressure.

Before committing, Marcus asked two questions about the actual system:

1. **What server-side enrichment exists today?** Answer: only `id`, `createdAt`, and `updatedAt` — no slug derivation, no normalized titles, no status recomputation from related entities. The domain is intentionally simple and has no computed fields beyond timestamps and IDs.

2. **What does the optimistic update implementation do with a successful response?** Answer: it uses `updatedAt` to update the lock token in local state and does nothing else with the response body. No reconciliation of the full entity occurs.

These two concrete facts resolved Marcus's fragmentation concern. The invariant is mechanical and stable for this domain because the set of "fields the server generates" is fixed (timestamps + IDs) and is not growing. The reconciliation benefit of Position B is provably zero for the current consumer.

Marcus conceded to Position A and added two conditions he treated as part of the decision: (1) the documented convention must be updated to scope "return the resource directly" to query endpoints explicitly, with a companion rule for command endpoints; (2) this decision warrants an ADR naming the load-bearing assumptions (first-party-only consumer, optimistic-update discipline, no server-side enrichment beyond timestamps/IDs) so that a future engineer who changes any of those assumptions knows exactly what to revisit.

## Decision

**Command endpoints return only server-generated fields the client cannot derive.**

The response shapes are:
- `POST` → `201 { id: string; createdAt: string; updatedAt: string }`
- `PATCH` / `PUT` → `200 { updatedAt: string }`
- `DELETE` → `204 (no body)`

The invariant is: *all fields the server generates that the client cannot predict from what it sent*. For this domain that is `id`, `createdAt`, and `updatedAt`. If a future command derives additional server-generated fields (e.g. a slug, a computed status), those fields are added to the command response — not the full resource.

The existing "return the resource directly" convention is re-scoped to apply to query endpoints only. Command endpoints follow the rule above.

**Load-bearing conditions.** This decision holds while:
- The API's sole consumer is the first-party SPA using optimistic updates
- Optimistic updates do not reconcile full entity state from the response on success
- The domain has no server-side enrichments beyond timestamps and IDs

If any of these conditions changes, the response shape should be re-evaluated against this ADR.

## Consequences / Tradeoffs

**Easier:**
- Backend command handlers are thinner: no re-fetch to assemble the full resource
- CQS principle is expressed consistently end-to-end
- API surface is minimal; expanding later is non-breaking

**Harder:**
- Any second consumer (internal service, webhook processor, third-party integration) will be surprised by non-mainstream behavior and must be explicitly documented on the convention
- If the domain gains server-side enrichments, the response shape must be widened deliberately and the invariant re-checked per endpoint
- The documented convention must be updated — this decision is incomplete without that update

**Reversibility:** Medium. Adding fields to command responses is non-breaking. Switching to full-resource responses (Position B) requires frontend changes to consume and reconcile the response, plus backend changes to re-fetch after write. Not cheap to undo, but not catastrophic either. The ADR flags the conditions that would trigger the re-evaluation.

## Related
- `adr-0001-adr-format-one-file-per-decision.md` — ADR format
