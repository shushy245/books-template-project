# ADR 0007: Concurrent Claude Code Sessions — Worktrees vs. Serialization

## Status
Revised — 2026-06-15 (initial decision reversed; see Deliberation for correction)

## TL;DR
Adopt per-session git worktrees now. Concurrent Claude Code sessions are already a regular workflow and already causing real interference (stop hook failures, wasted token burn from cross-session corruption). The "serialization first" conclusion reached in the original deliberation rested on a false premise — that this was anticipatory — and is reversed.

## Context
The team uses trunk-based development — all commits go directly to main, no long-lived branches. Concurrent Claude Code sessions on the same repository are already a regular workflow, not a hypothetical. Sessions have been observed interfering with each other through the shared filesystem — most visibly as stop hook failures and wasted token burn tracing problems whose root cause was another active session editing the same files. The question is how to isolate concurrent sessions so they cannot corrupt each other's in-flight work.

## Options Considered

### Option A — Serialization rule ("one session per repo at a time")
- **For:** Zero infrastructure overhead. A one-sentence coordination rule everyone understands without explanation. No new filesystem artifacts, no stale directories, no cognitive load for engineers unfamiliar with git worktrees. The working directory is the working directory — nothing exotic to reason about at 2am.
- **Against:** Prevents genuinely parallel work streams (e.g., one session on backend, another on frontend simultaneously). If concurrent sessions become a regular workflow, the coordination cost scales with frequency. The protection is social/procedural rather than technical, making it possible to violate accidentally.

### Option B — Per-session git worktrees
- **For:** Provides genuine filesystem-level isolation between sessions — two sessions cannot overwrite each other's in-flight file writes. Fully compatible with trunk-based development (each worktree commits frequently on a short-lived branch and rebases to main at session end). The mechanism (git worktrees) exists precisely for this use case.
- **Against:** Git worktrees are not widely understood by most engineers — "what are these directories" is a real 2am confusion. Stale worktrees accumulate without a cleanup discipline. More critically: worktrees **move** the conflict rather than eliminate it. If two sessions both touch shared types or common files, the file-level collision is replaced by a rebase conflict between two diverged AI-session histories — which is arguably harder to diagnose and reconcile than the original problem.

## Deliberation

**Initial deliberation (reversed):** The working agent opened arguing for worktrees; Marcus Reid pushed back with two points: (1) the failure mode is visible and bounded — broken build, visible diff, restart the session — so YAGNI holds; (2) worktrees move the conflict rather than eliminating it — if two sessions touch shared types, you replace a filesystem collision with a rebase conflict between diverged AI-session histories. The working agent conceded both points and concluded: serialization first, worktrees when the one-session rule creates real friction. The general principle surfaced was sound: YAGNI applies based on failure-mode visibility, not category.

**Correction:** The entire deliberation rested on a false premise — that concurrent sessions were anticipatory. They are not. Sessions have been interfering regularly, with stop hook failures and token burn as concrete, felt symptoms. The frequency-driven trigger ("add worktrees when concurrent sessions become a regular daily workflow") is already met. The "worktrees move the conflict" argument remains true but is irrelevant at this frequency: the git-level rebase conflict is a manageable coordination cost; the filesystem-level session corruption is an active operational problem. Worktrees are warranted now.

**What the principles from this deliberation still hold:** YAGNI-by-visibility is correct as a general rule. A coordination rule over infrastructure is correct when frequency is low. Both conclusions were right in principle but wrong in application because the frequency premise was wrong. The meta-lesson: "is this anticipatory?" is a factual question that requires checking, not assuming.

## Decision

Adopt per-session git worktrees. Each Claude Code session works in its own isolated worktree. Sessions commit frequently to a short-lived worktree branch and rebase to main at session end. Stale worktrees are cleaned up when the session ends.

## Consequences / Tradeoffs

**Easier:**
- Concurrent sessions cannot corrupt each other's in-flight file writes
- Stop hook failures from cross-session interference are eliminated
- Each session has a clean, isolated working state

**Harder / accepted costs:**
- Git worktrees are not well-understood by all engineers — the naming convention (`worktrees/<session-id>`) and cleanup discipline must be established
- Integration step at session end (rebase to main) is now explicit — if two sessions touch shared types, a rebase conflict still requires human resolution
- Stale worktrees accumulate without a cleanup discipline

**Reversibility:** High. Drop the worktree practice by returning to working in the main directory; no lasting artifacts remain in the codebase.

## Related
- None (first decision touching AI session workflow)
