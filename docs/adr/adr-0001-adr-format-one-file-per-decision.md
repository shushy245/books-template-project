# ADR 0001: Record Architecture Decisions As One File Per Decision

## Status
Accepted — 2026-06-03

## TL;DR
Architecture decisions are recorded as one Markdown file per decision under `docs/adr/`, named `adr-NNNN-title.md` with a zero-padded sequence number. A single continuously-appended decisions log was rejected. Supersession is tracked with a single canonical forward link (`Supersedes:` on the new ADR); the reverse direction is derived by grep, not hand-maintained.

## Context
We are introducing Architecture Decision Records to this (greenfield) repo — no prior ADR directory, no tooling (adr-tools, log4brains), and no docs site indexing a folder. The storage format must be chosen before the first ADR is written: converting later is cheap but still touches every record and any links. Two formats were weighed — one file per decision vs. a single appended log — alongside the lifecycle question that actually determines whether an ADR archive stays trustworthy: how superseded decisions are marked.

## Options Considered
### Option A — One file per decision (`adr-NNNN-title.md`)
- **For:** Self-documenting, greppable filenames; `git log` on a single file tells one decision's story without archive-wide noise; each new ADR is a new path, so no shared append-point merge conflicts; every decision is independently linkable and diffable; consistent with a repo built on small, greppable, self-documenting files.
- **Against:** Number-allocation collisions — two branches can both grab `adr-0008` (minor; resolved by renaming on rebase); more files in a directory.

### Option B — Single appended decisions log
- **For:** One file to open; trivially greppable in one place at small N.
- **Against:** Grows into an unnavigable monolith; the append-at-bottom pattern is the `CHANGELOG.md` disease — every change touches the same last line, producing constant merge conflicts; individual decisions are hard to link to or diff in isolation; contradicts the repo's small-files philosophy.

## Deliberation
Both parties favored one file per decision; the debate refined the *reasoning* and the *artifact*, not the verdict.

- The working agent led on merge conflicts and linkability. Marcus reframed: the "2am incident" lens is a wash — ADRs aren't an incident tool, they earn their keep six months out, in daylight, when someone changes a thing and needs to know why. Per-file wins on **cognitive load** (glob + read titles, `git log` on one file) over `ctrl-F` through a 4,000-line monolith.
- Marcus credited the merge-conflict point but corrected the mechanism: it is the append-at-bottom `CHANGELOG` pattern, not "monoliths" per se — and named the one residual friction the working agent had glossed: **number-allocation collisions** across branches.
- Marcus's strongest single point, and what moved him to plant the flag: **consistency** — a monolith would be the one place the repo contradicts its own "small, greppable, self-documenting files" philosophy.
- Marcus insisted on right-sizing: this is cheap and fully reversible (a ~20-line script converts either direction), so the deliberation budget belongs on the **lifecycle**, not the format.
- Final concession (working agent moved): the reciprocal `Supersedes` / `Superseded-by` back-link is a **dual-write** that rots in an untooled repo — nobody reopens a retired decision to annotate it, so the old ADR silently looks live. Fix: make the forward link (`Supersedes:` on the new ADR) canonical and mandatory; derive the reverse with `grep -rl "Supersedes: 0005" docs/adr/`. Do not mandate a hand-written back-link — that rule is borrowed from a tooled world (log4brains writes both for you) and does not survive the transplant.
- Two YAGNI riders agreed: omit a `Proposed` status if ADRs are only written as records of decisions already made (an unreachable enum case); add `Deprecated` only when a decision first dies without a successor; do not maintain a hand-written `README.md` index on day one (a third copy that drifts) — `ls docs/adr/` plus a Status grep is the index until navigation actually hurts.

## Decision
Record each architecture decision as its own file under `docs/adr/`, named `adr-NNNN-title.md` with a zero-padded sequence number. Reject the single appended log. Track supersession with a single canonical forward link (`Supersedes:`) on the superseding ADR; treat the reverse direction as derivable via grep, not as maintained data. Keep the Status set minimal and matched to the actual workflow (`Accepted` / `Superseded`; add `Deprecated` only when first needed).

## Consequences / Tradeoffs
- **Easier:** finding, linking, and diffing individual decisions; conflict-free parallel authoring; an archive whose structure matches the rest of the repo.
- **Harder / knowingly accepted:** occasional `adr-NNNN` number collisions across branches (resolved by renaming on rebase); no rendered index until one is scripted; supersession trustworthiness now depends on the forward-link convention being followed — mitigated by it being a single write rather than a dual write.
- **Reversibility:** high — a ~20-line script converts per-file ↔ monolith in either direction, so this is safe to revisit if it ever proves wrong.

## Related
- None (first ADR).
