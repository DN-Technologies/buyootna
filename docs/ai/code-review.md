# Code Review Standards

Read this when doing a review task, or when self-reviewing before handing
work back. Claude Code's built-in `/code-review` (a.k.a. "ultrareview") is
the actual review *tool* — this file is the standard it and any human
reviewer should hold changes to, not a replacement for it.

## What this repo's history holds changes to

- **No premature abstraction or scope creep.** A bug fix doesn't need
  surrounding cleanup; don't generalize a one-off into a reusable
  abstraction unless the task actually calls for it. Three similar lines
  beats a speculative shared helper.
- **Comments explain WHY, not WHAT.** A comment describing what the next
  line does (when the code is already readable) is noise. A comment
  explaining a non-obvious constraint, a workaround for a specific bug, or
  why an option that looks reasonable was deliberately not taken — that's
  worth keeping. Don't reference the current task/ticket/PR in a comment;
  that context belongs in the commit message and rots as the code moves.
- **Empirical verification before claiming a fix works** — see
  [`testing-policy.md`](./testing-policy.md). A review should treat "ran
  `tsc --noEmit`" and "actually tested the behavior" as different claims,
  and check which one was actually made.
- **Match existing patterns over introducing a new one.** Before adding a
  new approach (a new state-management pattern, a new test-mocking style,
  a new API-client convention), check whether this repo already has an
  established one and use it — see [`architecture.md`](./architecture.md)
  and [`testing-policy.md`](./testing-policy.md) for the ones already
  documented.

## Commit convention

Commit messages in this repo's history explain the root cause and the
fix, not just what changed — e.g. "fix(mobile): X" with a body describing
what was actually wrong and why the fix addresses it, not just "fixed X
bug." End AI-authored commits with:

```
Co-Authored-By: <model name> <noreply@anthropic.com>
```

## Merge gate

- `main` is never pushed to directly — blocked by a pre-push hook.
- Changes land via a `dev` → `main` pull request, gated by required
  `.github/CODEOWNERS` review.
- See [`release-policy.md`](./release-policy.md) for what happens after a
  merge (deploy is a separate, manual step).
