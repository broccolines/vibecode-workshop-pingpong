# Current focus

Plan agreed with Niklas on 2026-10-20 (commit `82ebb23` on `main`). **Eric's confirmation of
PLAN.md is still pending** — PLAN.md line 3 says so, and nothing in the repository records it
as done.

Agent routing, context packets, gates and the cut line: `docs/agent-routing.md` (plain-text
mirror: `steps.txt`). Where the two disagree, `docs/agent-routing.md` wins.

State on 2026-10-20:

- **M1.1** deployed and live (guest and public smoke recorded by Niklas's lead session). The
  evidence branch `m1.1-live-url` is not merged and is under review. Eric's phone check and the
  Actions enablement are still open.
- **M1.2** shared data contract drafted (`docs/data-contract.md`, branch `m1.2-data-contract`,
  PR #2). Not merged; Niklas has not read it yet.
- **M1.3** first recorded match: brief written, coder session running.

Next: finish the M1.3 review and merge, then the fun track (M3.1 → M3.2 → M3.3). M2 and M3
stay closed until M1.3 has merged (gate G2). No release before both humans accept the journey
at the live URL (gate G3).
