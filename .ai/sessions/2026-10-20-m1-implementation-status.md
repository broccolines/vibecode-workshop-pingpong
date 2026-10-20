# Session — 2026-10-20 M1 implementation status (project lead)

Stopped on request. This file is the handover: what is done, what is open, and what must not
go wrong next.

## What is finished

- **M1.1** is deployed and live (`82ebb23`, the `main` commit at the time). Niklas ran the
  deploy; the evidence branch `m1.1-live-url` (PR #3) carries the evidence. The assigned URL
  had been committed into that branch, so the branch history was **rewritten before any merge**
  to keep it out of `main`. The tip is clean.
- **M1.2** — the shared contract — was written in **Niklas's** clone (the M1 lead works there),
  reviewed to APPROVE by an independent reviewer, and is PR #4. Eric answered the four
  fun-track questions on 2026-10-20 (Q1 rest, Q2, Q7, Q10) and they are recorded in the
  contract's section 9.
- Four pull requests are open: #1 (plan and routing), #3 (M1.1 evidence), #4 (M1.2 contract),
  #5 (M1.3 first recorded match).

## What is NOT finished

- **`main` is still at `82ebb23`. Nothing is merged.** PR #4 is the next one to merge: its
  contract text is settled and only evidence-file findings are open (see below).
- **M1.3 has to be reshaped.** Its coder session started before M1.2 was agreed, against a
  draft contract that has since been replaced. The storage layer, HTTP plumbing, test harness
  and page shell are reusable; the **record shapes are not**. The new brief is
  `.ai/work/M1.3/brief.md` on `main` (after PR #4 merges), with a table of what to reshape.
- **M3.1–M3.3 (the fun track) have not started.** Their briefs are written and ready:
  `M3.1` (casual invite experience), `M3.2` (the casual result), `M3.3` (merry-go-round).
- The **M1.4 phone journey** needs an explicitly authorised early release of the M1.3 SHA
  before the humans can walk the journey at the live URL.

## Three traps for whoever picks this up

1. **PR #5 (M1.3) must not be merged as it stands.** It was built on top of the *superseded*
   M1.2 draft, so it still carries that draft's `docs/data-contract.md` and
   `.ai/work/M1.2/*` files. Merging it would put the draft contract into `main` and collide
   with PR #4's contract. Rebase it onto `main` **after PR #4 merges** and drop those files.
2. **PR #5 was pushed from a working directory that no longer exists** (its layout is `lib/`,
   while the worktree at `/tmp/opencode/pp-m13` holds an earlier iteration with `src/` and 11
   uncommitted files). Both exist; neither is authoritative. The pushed branch is the later
   one.
3. **PR #5's review is not independent.** The coder session dispatched its own reviewer and
   wrote `.ai/work/M1.3/review.md` itself. A fresh session must review the reshaped step.

## Open review findings, by branch

**PR #4 (M1.2 contract)** — the contract text is settled; these are evidence-file findings:
one table of rounds is needed in `.ai/work/M1.2/review.md` (the round headings were spliced
into the middle of round 2's body, leaving two reviewer identities and an APPROVE for an old
SHA under the wrong heading); the round-3 finding count is wrong (says six, lists eight);
the "checks run" section does not cover the last commit; `IDEA.md` still lists the confirmed
"invite" decision under "assumptions we need to test".

**PR #3 (M1.1 evidence)** — four small ones: `validation.md` says the branch "carries a single
commit" (it carries three) and says the merge "happened" (it has not); the review file's head
list stops at round 3 and does not contain the newest SHA; the reviewer-session count is stale.

**PR #1 (plan and routing)** — one major: both routing files still say "no release before G3",
which contradicts the M1.4 early release the same files require, so a lead following the
checklist would refuse the human's release instruction. Also: the M1.4 table row still says
"both humans, no agents" though the release is committer-run; `steps.txt`'s G1 does not
block M1.3; the routing files still call Eric's "invite" question open although he answered
it; `.ai/context.md` carries an unsafe `git reset --hard` one-liner and omits M1.1's open
items; the session handoff is stale.

## Still only for the humans

- **Eric's phone check** of the assigned URL (blocks PR #3).
- **Niklas's local clone** must be realigned after the force-push: check `git status` first,
  save any uncommitted work, then `git fetch origin`, `git checkout m1.1-live-url`,
  `git reset --hard origin/m1.1-live-url`.
- **GitHub Actions** produces no runs for this fork — an organiser-side setting.
- **Niklas has not read the contract's open questions Q3, Q5 and Q9.**

## Handoff

State: `main` at `82ebb23`; four open PRs; the contract agreed by both humans on
`m1.2-data-contract-v2`; M1.3 built against a superseded contract and needing a reshape.
Next step: merge PR #4 once its evidence findings are fixed, then run the M1.3 fix round
against the merged contract in the coder's own session, then review it independently.
Half-done work: the M1.3 reshape, the M1.1/M1.2/plan evidence findings, and the whole fun
track M3.1–M3.3.
Branch / reviewed SHA / PR: see the list above.
Checks and limitations: `npm test` passes (21 tests, Node v20.11.1 locally — Node 22 is the
required runtime and was used by the coder sessions). No browser journey was verified by any
agent. No deploy was performed by an agent: the live revision is Niklas's `82ebb23`.
