# Session — 2026-10-20 agent routing (project lead)

## Decisions

- The plan is now executed by an explicit routing document: `docs/agent-routing.md` owns who
  runs each piece, what context each session may see (CX-0…CX-6) and what proves it is done.
  PLAN.md keeps ownership of outcomes, status and dependencies; the two documents do not
  duplicate each other.
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

### Audit facts that change the plan

- The app is the untouched static starter: no data layer, no API, no persistence. M1.3 onward
  is greenfield; the storage module and the acting-player rule must land in M1.2/M1.3 or the two
  tracks will invent incompatible versions.
- `gh` is not installed on this laptop, so the committer role cannot open or merge a PR as
  written.
- Local Node is v20.11.1 while `package.json` requires >= 22. Every session must run Node 22
  explicitly and say so in `validation.md` — the starter validation already hit this trap.
- The plan documents were pushed straight to `main` (`82ebb23`) without a PR. Docs only, no
  code, but this routing document goes through a PR instead.

## Handoff

State: `docs/agent-routing.md` written; `.ai/context.md` updated. `main` == `origin/main` at
`82ebb23`. Branch `plan-agent-routing` holds the routing document and the context update.
Next step: answer D1–D5, install GitHub CLI, place the organiser handout in
`.workshop.local.md`, then open the M1 milestone lead session (`/milestone-lead M1`) in the
fork owner's clone and start M1.1.
Half-done work: none. No code changed, no PR opened (`gh` missing), no deploy attempted.
Branch / reviewed SHA / PR: `plan-agent-routing`, base `82ebb23`, no PR yet.
Checks and limitations: `npm test` passed locally (21 tests) on Node v20.11.1 — not the
required Node 22, so the runtime caveat in the routing document applies to every later session.
No team container, SSH, DNS or public URL was exercised; no browser journey was run.
