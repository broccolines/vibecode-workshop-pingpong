# Current focus

Plan agreed with Niklas on 2026-10-20 (commit `82ebb23` on `main`). **Eric's confirmation of
PLAN.md is still pending** — PLAN.md line 3 says so.

Agent routing, context packets, gates and the cut line: `docs/agent-routing.md` (plain-text
mirror: `steps.txt`). Where the two disagree, `docs/agent-routing.md` wins.

State on 2026-10-20, evening:

- **M1.1** is live (`82ebb23` deployed, public smoke observed). The evidence branch
  `m1.1-live-url` (PR #3) is under review after a history rewrite that removed the assigned URL
  from the branch before it could reach `main`. Still open: **Eric's phone check**, Eric's push
  access, GitHub Actions producing no runs, and Niklas's local clone needing a realignment
  (`git fetch origin && git reset --hard origin/m1.1-live-url`).
- **M1.2** — the shared data contract — was written in **Niklas's** clone (the M1 lead works
  there), reviewed to APPROVE, and is PR #4. Eric answered the four fun-track questions on
  2026-10-20 (Q1 renaming and "me", Q2 no confirmation for casual and fun, Q7 "invite" means
  inside our app, Q10 a declined invite keeps its record but never counts as a played match).
  The amendment is under review. A parallel M1.2 draft from this clone (PR #2) was closed in
  favour of #4 and is kept as evidence.
- **M1.3** — the first recorded match — has a coder session running, but it was started
  against the **superseded** draft contract, before PR #4's contract was known. That is a
  recorded waiver of gate G1 (see below). The implementation will be reshaped to the merged
  contract in a fix round before it is reviewed.

**Gate G1 waiver (recorded, deliberate).** M1.3's coder started before M1.2 merged. The
rework risk is known and accepted: the storage layer, HTTP layer, test harness and UI shell
can be reused, but the domain layer must be reshaped to the merged contract's record shapes.
Nothing else started before a gate.

No **final** M1 release before gate G3. The M1.4 phone check runs on an explicitly
authorised early release of the M1.3 SHA (see `docs/agent-routing.md` §5).

Next: merge PR #4 when its amendment review clears; then the M1.3 fix round against the merged
contract; then the fun track (M3.1 → M3.2 → M3.3). M2 and M3 stay closed until M1.3 has
merged (gate G2).
