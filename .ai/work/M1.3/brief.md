# M1.3 — First recorded match

## Outcome

A visitor at https://team-03.intra.land, on a phone or a laptop, can create a player and record a finished one-on-one match result between two players. The players and the result are still there after a reload, on another device, and after the app restarts or is redeployed. This step builds the shared player and match code that M2 (ladder) and M3 (fun) both write through. It enforces the rules of `docs/data-contract.md` in one place.

## Audit

- Base: the approved M1.2 head on `m1.2-data-contract-v2` (contract reviewed at `df0e3f1`, plus a review-evidence commit). The coder records the exact base SHA it starts from in validation.md. If M1.2 has merged by the time coding starts, the base is current `main` instead.
- App today: `server.mjs` uses only Node's `http` module, with no dependencies. It serves only `public/index.html` and `public/style.css`, answers `GET`/`HEAD` and rejects everything else with 405. `GET /api/health` returns `{ok, revision}`. `test/app.test.mjs` covers these, and asserts that a POST to `/` is rejected and that repository files are not downloadable.
- Contract to implement: `docs/data-contract.md` sections 1 (player), 2 (match envelope and state table), 3 (acting player, honour system), 6 (storage) and 7 (failure cases). Ratings, the queue, invites and merry-go-round belong to later steps.
- Guest facts (`.ai/rules.md`): no sudo, port 3000, releases are immutable snapshots, durable data goes outside them (default `~/.local/share/vibecode-workshop/data/`, overridable through the env var `DATA_DIR`, see contract Q9). The guest runs Node 24. Deploy runs `npm ci` and `npm test` first.

## How a match gets recorded in this step

Ranked matches can only be created by the queue (Q11, M2.2), and invites are M3.1. M1.3 therefore needs a minimal way to record an already-played 1v1. Requirement: a recorded match is stored as a valid contract match record with `mode` `casual`. For this step the reporter is the acting player, and the match is stored directly in state `confirmed` with `createdBy`, `reportedBy`, `reportedAt` and `confirmedAt` set. This is a "played already, just log it" shortcut, and it must still pass every section 7 check that applies. Every field the record lacks must be filled as the contract shapes it. If the coder finds this conflicts with the contract, it stops and reports rather than changing the contract.

## Acceptance

- [ ] **Normal case:** on a fresh data directory, create players "Anna" and "Ben". As Anna, record Anna 2–1 Ben. The match list then shows "Anna 2–1 Ben" (or equivalent) with a time. After a reload, in a second browser or device, and after `npm start` is stopped and started again with the same `DATA_DIR`, both players and the match are still shown.
- [ ] **Empty state:** with no players and no matches, the page explains what to do first (create a player). With one player, it explains that a second player is needed.
- [ ] **Failure cases** (each one shows a clear message, and nothing is stored or changed): a match against a nonexistent player ID, the same player on both sides, equal scores or no winner, a missing, negative or non-whole score, an acting player who does not exist or is not a participant, a duplicate name (`Anna` vs ` anna `), and an empty, whitespace-only or too-long name.
- [ ] **Data boundary:** the data files are written under `DATA_DIR` (or the default path), never inside the repo or release directory. They are not served over HTTP. Repository files and traversal requests still return 404. Two concurrent player creations with different names both survive, and two concurrent identical-name creations leave exactly one. A crash mid-write never leaves a corrupt store (contract §6.4). The coder explains how this is met.
- [ ] **Contract shape:** stored player and match records match contract sections 1 and 2, including `schemaVersion`, server-generated IDs and ISO timestamps. Matches refer to player IDs, not names. Unknown fields in stored records are preserved.
- [ ] **Deploy contract kept:** `/api/health` is unchanged, the app listens on `PORT` (default 3000), the `scripts/` and lockfile are intact, and `npm test` passes, except the known macOS-only `flock` test. Any new dependency is justified and locked in `package-lock.json`.
- [ ] **Browser task:** at desktop width and at phone width (about 390 px), complete the normal case using only the page: pick or create yourself, create the opponent, record 2–1, reload. Controls are tappable and nothing scrolls horizontally. Record how this was checked. If there is no browser tool, say so plainly instead of claiming it.

## Boundaries and dependencies

- Depends on M1.2 (the contract). Do not change `docs/data-contract.md`. If something in it can't be built, stop and report.
- Out of scope: Elo or rating display, the ranked queue, confirm/dispute UI, invites, merry-go-round, login, page styling beyond a clean usable layout. Write the code so M2 and M3 can add modes and transitions without rewriting storage.
- Keep it small and readable. No framework is required; if the coder adds one, it must keep the framework replacement contract in AGENTS.md.
- No deploy in this step. The release happens on Niklas's instruction after the merge.

## Handoff

- Human owner: Eric in PLAN.md. Niklas is running it through this M1 lead by his decision of 2026-10-20 and will tell Eric when it merges. Both must accept the PR.
- Coder: `coder` subagent (Sonnet), branch `m1.3-first-match`.
- Reviewer: `reviewer` subagent (Opus), fresh context.
- Committer: `committer` subagent.
- Evidence: `.ai/work/M1.3/validation.md` and `.ai/work/M1.3/review.md`.
