# ADR 0007: Concurrent Claude Code Sessions — Worktrees vs. Serialization

## Status
Accepted — 2026-06-15

## TL;DR
Start with a serialization rule — one Claude Code session per repository at a time. Add git worktrees only when concurrent sessions become a regular daily workflow and the one-session rule creates real, felt friction. The failure mode of not having worktrees (filesystem collision) is loud and bounded, not silent; that disqualifies it from needing upfront protective infrastructure.

## Context
The team uses trunk-based development — all commits go directly to main, no long-lived branches. As AI-assisted development (Claude Code) becomes a regular workflow, the question of running multiple concurrent sessions on the same repository arises. When two sessions work simultaneously they both read and write to the same filesystem paths, creating a potential for one session's in-flight edits to be overwritten by another's. The question is whether to adopt git worktrees (one per session, isolating each session to its own working directory) as a defensive measure before this has actually caused a problem.

## Options Considered

### Option A — Serialization rule ("one session per repo at a time")
- **For:** Zero infrastructure overhead. A one-sentence coordination rule everyone understands without explanation. No new filesystem artifacts, no stale directories, no cognitive load for engineers unfamiliar with git worktrees. The working directory is the working directory — nothing exotic to reason about at 2am.
- **Against:** Prevents genuinely parallel work streams (e.g., one session on backend, another on frontend simultaneously). If concurrent sessions become a regular workflow, the coordination cost scales with frequency. The protection is social/procedural rather than technical, making it possible to violate accidentally.

### Option B — Per-session git worktrees
- **For:** Provides genuine filesystem-level isolation between sessions — two sessions cannot overwrite each other's in-flight file writes. Fully compatible with trunk-based development (each worktree commits frequently on a short-lived branch and rebases to main at session end). The mechanism (git worktrees) exists precisely for this use case.
- **Against:** Git worktrees are not widely understood by most engineers — "what are these directories" is a real 2am confusion. Stale worktrees accumulate without a cleanup discipline. More critically: worktrees **move** the conflict rather than eliminate it. If two sessions both touch shared types or common files, the file-level collision is replaced by a rebase conflict between two diverged AI-session histories — which is arguably harder to diagnose and reconcile than the original problem.

## Deliberation

The working agent initially characterized the filesystem collision failure mode as "subtle, non-obvious, and hard to diagnose" and used that framing to argue for worktrees as upfront protection. Marcus Reid challenged this characterization directly: the failure mode is neither subtle nor hard to diagnose. When two sessions overwrite each other's in-flight edits, the result is broken code, failing tests, or a compile error — loud, immediate, and git-tracked. There's no silent propagation; the failure announces itself and is fixable by restarting the session. This is a crucial distinction because YAGNI holds for failures that are visible and bounded; it does not hold for failures that are silent, propagating, or unrecoverable (e.g., missing pagination contract, missing outbox pattern, missing DLQ).

Marcus also surfaced the "worktrees move the conflict, not eliminate it" argument, which was decisive. If both sessions touch shared types — the most likely collision point in a frontend+backend parallel workflow — filesystem isolation doesn't help. The two sessions accumulate diverged commits on their respective worktree branches and someone must reconcile the diverged AI-session histories at rebase time. This conflict is harder to understand and resolve than the original filesystem collision, because it requires reconstructing intent from two independently running sessions.

The working agent conceded both points. The debate produced a frequency-driven trigger: worktrees become worth their overhead when concurrent sessions are a regular daily workflow, because at that point the one-session coordination rule creates genuine friction and the overhead amortizes across many sessions. Until that threshold is reached, the serialization rule is unambiguously better — zero overhead, zero cognitive tail, equivalent protection against the (visible and bounded) failure mode.

One important secondary point from the debate: the meaningful axis for whether YAGNI applies is **not** "architecture vs. developer tooling." It is **visible-and-bounded vs. silent-and-unrecoverable**. This reframing is load-bearing: it's why pagination gets built before the first list endpoint (missing pagination is a breaking change for every consumer — silent divergence between client expectations and server contract), but worktrees wait until needed (collision is loud and immediate).

## Decision

Start with serialization. One Claude Code session per repository at a time is the rule until concurrent sessions are a genuine daily workflow. At that point, revisit with the specific collision patterns that have actually been felt as the design input.

**Trigger to revisit:** Concurrent sessions become a regular (multiple times per week) daily workflow, AND the one-session rule creates real, felt friction in practice.

## Consequences / Tradeoffs

**Easier:**
- No new filesystem artifacts to manage or clean up
- No cognitive overhead for engineers unfamiliar with git worktrees
- Working directory is the single source of truth — no confusion about which directory reflects current state
- If a collision does happen, the failure is visible and bounded — restart the session

**Harder / accepted costs:**
- Cannot parallelize work streams (frontend + backend simultaneously) until the trigger fires
- The protection is procedural, not technical — accidental violation is possible (though Claude Code sessions are typically user-initiated, so the coordination surface is small)

**Reversibility:** High in both directions. Adding worktrees later requires `git worktree add`; removing them is `git worktree remove`. Neither choice creates lasting artifacts in the codebase.

## Related
- None (first decision touching AI session workflow)
