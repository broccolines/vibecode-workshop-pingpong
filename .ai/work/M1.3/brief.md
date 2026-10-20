# M1.3 — First recorded match

## Outcome

A visitor can join as a player and record a one-on-one match result. The result survives a
reload, a second visitor and a restart of the app. The page knows who you are, so later steps
can act as a player (confirm, dispute, accept an invite).

This is Eric's step. It is also the base both tracks build on, so it establishes the shared
core described in `docs/data-contract.md`.

## Audit

- `server.mjs` is the untouched starter: static assets, `/api/health`, `405` for everything
  else. No data layer, no mutation routes.
- `docs/data-contract.md` (M1.2, merged) is the format this step implements. It is the
  authority for ids, states, storage location and the HTTP surface.
- Base SHA for this step: see the branch `m1.3-first-match` parent — the commit of `main`
  after M1.2 merged.
- There is no test for a data layer yet; `test/app.test.mjs` only covers the static page and
  the health endpoint.

## Acceptance

- [ ] **Normal case:** two players are created, a 2–1 result is recorded, and both players see
      it after reloading the page and on a second device. The result is stored on the server,
      not in the browser.
- [ ] **Acting player:** the page shows who you are and lets you pick or create that player.
      The choice is remembered in the browser (`localStorage` key `pp.playerId`) and is sent
      to the server with every action.
- [ ] **Empty state:** with no players and no matches, the page explains what to do first
      instead of showing an empty table.
- [ ] **Failure case:** reporting a match against a nonexistent player, a match with no
      winner, a match with the same player twice, or a match with fewer than two players is
      refused with a clear message and stores nothing.
- [ ] **Restart:** the data is still there after the app restarts.
- [ ] **Data boundary:** the store file lives under `DATA_DIR` (default
      `~/.local/share/vibecode-workshop/data/`), never inside the release directory and never
      in the repository.
- [ ] **Contract:** players, matches, states, ids and endpoints follow
      `docs/data-contract.md` §1, §2, §6 exactly.
- [ ] **Deployment contract:** `/api/health` still returns `{"ok": true, "revision": ...}`,
      the server still listens on `PORT` (default 3000) on `0.0.0.0`, and the repository root
      and `.env` are still not downloadable.
- [ ] **Tests:** `npm test` passes on Node 22, with new tests covering the normal case, the
      failure cases, the empty state and the restart.

## Boundaries and dependencies

- Depends on: M1.2 (`docs/data-contract.md`, merged).
- Must not: change `player.rating` (it stays 1000 until M2.1), add any queue, tournament,
  invite or round behaviour, or change the deployment scripts.
- The fun track and the ladder track both start from this code, so the shared core
  (`server.mjs`, `src/store.mjs`, `src/domain.mjs`, `src/routes/core.mjs`,
  `public/index.html`, `public/app.js`) must follow the ownership map in
  `docs/data-contract.md` §8, so that Niklas can add his route module and his views without
  conflicting.

## Handoff

- Human owner: Eric.
- Coder session: one session, implements this step on branch `m1.3-first-match`.
- Reviewer session: a different session and a different model, reviews base..head.
- Evidence: `.ai/work/M1.3/validation.md`, `.ai/work/M1.3/review.md`.
- Browser task: join as a player, report a 2–1 result, reload, and repeat on a second
  device — at 1440×1000 and 375×812.
