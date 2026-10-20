# Session — 2026-10-20 agent routing (project lead)

## Decisions

- The plan is now executed by an explicit routing document. `docs/agent-routing.md` owns who
  runs each piece, what context each session may see (CX-0…CX-6) and what proves it is done.
  PLAN.md keeps ownership of outcomes, status and dependencies.
- **`steps.txt` in the repository root is a plain-text mirror of `docs/agent-routing.md`,** not
  a second source of truth. Where the two disagree, `docs/agent-routing.md` wins. The M2 and
  M3 tables in both files restate PLAN.md's outcome and dependency columns as a mirror;
  PLAN.md wins there too. This duplication is deliberate — `steps.txt` was requested as a
  quick-reference plain-text copy — and the winner is named in both files.
- Milestone gates are named so no session can start on a wish: G0 live, G1 contract frozen,
  G2 first record, G3 milestone accepted, G4 contract-change window closed. After G2, a change
  to the shared format is a new M1.x step agreed by both humans, never a quiet edit inside a
  track branch.
- Reviews stay independent by construction: the coder, the reviewer, the committer and the
  partner check each get a different context packet, and the reviewer's packet deliberately
  excludes the coder's reasoning.
- Parallel M2/M3 ownership is fixed by path: shared core frozen at G2, one file (the UI route
  registry) has a single owner at a time, and only one step merges at a time — the second track
  rebases and re-runs its own acceptance cases after a shared-core merge.
- A cut line for the one-day workshop is written down: P0 = M1.1–M1.4, M2.1–M2.3, M3.1–M3.2;
  sacrifice M3.4 → M2.4 → M3.3, decided by the human, never a silent hole.
- Five decisions are open for the human (D1–D5 in `docs/agent-routing.md` §9): keep the
  dependency-free starter instead of a framework swap, who runs the M1 milestone lead and in
  whose clone, whether "acting player" belongs to M1.3, installing GitHub CLI, and the cut
  line order.

### Review round on this branch (REQUEST CHANGES → fixed)

An independent reviewer (opencode subagent, `deepseek-v4.1-flash-free`) reviewed this branch
and returned REQUEST CHANGES with 5 major, 7 minor and 3 nit findings. The fixes:

- **Context packets may no longer narrow AGENTS.md.** AGENTS.md line 3 requires every session
  to read IDEA.md, PLAN.md, `.ai/rules.md` and its role brief. IDEA.md and PLAN.md are now in
  CX-0, and the "read PLAN.md only for its own row" restriction is gone. A packet may add
  reading, never remove it.
- **The committer's SHA check was impossible.** After the report-only commit the head is no
  longer the reviewed SHA. Both committer phases now name the report commit as the merge
  target, require proof that it differs from the reviewed SHA only under `.ai/work/<STEP>/`,
  and record both SHAs.
- **Gate G3 was circular.** The M1.4 phone journey needed a live build, and the live build
  needed an accepted milestone. M1.4 now names its own explicitly authorised early release
  (deploy the M1.3 SHA on the human's instruction, smoke from a laptop, then the phone
  journey), following the `docs/workflow.md` precedent.
- **Three "authoritative homes"** for routing. The winner is now named in both routing files,
  and the M2/M3 tables are labelled as mirrors of PLAN.md.
- **`docs/repo-tour.md` claimed branch protection** that `docs/workflow.md` says is not
  assumed. Corrected to "CI reports red or green; it does not block by itself".
- Also corrected: `server.mjs` answers 404 for unknown paths (405 is for other methods); the
  stale branch SHA; the cut-line wording; the `M1.3a` id (now the appended id `M1.5`); where
  M1.1's evidence branch lives; who reviews M1.2's draft; "merging is a human act" versus the
  committer session that merges; and that **Eric's confirmation of PLAN.md is still pending**.

### Audit facts that change the plan

- The app is the untouched static starter: no data layer, no API, no persistence. M1.3 onward
  is greenfield; the storage module and the acting-player rule must land in M1.2/M1.3 or the two
  tracks will invent incompatible versions.
- `gh` is not installed on this laptop. A GitHub credential *is* stored for github.com, so
  PRs are opened through the GitHub API against the team fork. Same repository, same
  protections.
- Local Node is v20.11.1 while `package.json` requires >= 22. Every session must run Node 22
  explicitly and say so in `validation.md` — the starter validation already hit this trap.
- The plan documents were pushed straight to `main` (`82ebb23`) without a PR. Docs only, no
  code, but this routing document goes through a PR instead.

## Handoff

State: `docs/agent-routing.md`, `steps.txt` and `docs/repo-tour.md` written and reviewed;
round-1 findings fixed on this branch. `main` is at `82ebb23`; this branch is `plan-agent-routing`.
Next step: the re-review of this branch, then the M1.3 fix round against the revised data
contract, then the fun track (M3.1 → M3.2 → M3.3).
Half-done work: none on this branch. M1.1's evidence PR and M1.2's contract PR are open and
wait for their reviewers.
Branch / reviewed SHA / PR: `plan-agent-routing`, base `82ebb23`, PR #1.
Checks and limitations: `npm test` passed locally (21 tests) on Node v20.11.1 — not the
required Node 22, so the runtime caveat applies to every later session. No team container, SSH,
DNS or public URL was exercised; no browser journey was run.
