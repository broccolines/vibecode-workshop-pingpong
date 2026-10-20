# M1.2 — Shared player and match format

## Outcome

Niklas (ladder track) and Eric (fun track) can each build their steps on one written agreement, `docs/data-contract.md`. It covers what a player is, what a match is, who may change a match, which track owns which fields, and where data lives on the server. A reader can tell from the document alone how a ranked 1v1, a casual invite and a merry-go-round round are recorded.

## Audit

- Base: `main` at `82ebb237da32c2910fc55fb960a301cd7a92b455`. The M1.1 PR (`m1.1-live-url`) touches only `.ai/` files and does not conflict.
- `docs/data-contract.md` does not exist. The app is the unchanged starter, with no data storage and no API beyond `/api/health`.
- Fixed inputs (PLAN.md and IDEA.md, decided 2026-10-20): in-person table tennis; a simple display name for the demo; a stable internal player ID separate from the name; an empty slot for a later 42 intra login (M5.1); Elo starts at 1000 with K = 32; ratings come only from confirmed `ranked` matches and are reproducible by replaying them; data survives reloads, restarts and redeploys and is stored outside the release folders (`.ai/rules.md`).
- Track briefs: `.ai/team/niklas.md` (queue, confirm/dispute, tournaments) and `.ai/team/eric.md` (invites, merry-go-round with 3+ players, ordered eliminations).

## Acceptance

The document must answer each point below, and each answer must be checkable by reading it:

- [ ] Player: a stable ID that is never reused or changed, the display name, an empty external-login field for M5.1, and the creation time. It states whether two players may share a display name, and how a name is validated (length, whitespace, empty).
- [ ] Match: the mode (`ranked`, `casual` and the fun-mode values, extensible without breaking stored data), participants as player IDs (2 or more), the states and their allowed transitions (at least proposed → reported → confirmed / disputed, plus declined or cancelled where Eric's invites need them), the result (score for 1v1, ordered placings or eliminations for multi-player), and timestamps.
- [ ] Authority: who may create, report, confirm, dispute, accept or decline in each mode. For example, only the loser confirms a ranked result. Without a login, this is an honour system based on the chosen player; the document says so.
- [ ] Ownership: which fields and modes each track owns. Elo is derived and never typed in. It comes only from `confirmed` `ranked` matches, so a casual or fun match can never change a rating.
- [ ] Storage: where the server keeps data (under `~/.local/share/vibecode-workshop/data/` or a path configured through env), and that it survives a redeploy. Concurrent writes from two visitors must never lose a record. It states the requirement, not the implementation.
- [ ] Failure and boundary cases are written down: a match against a nonexistent player, a player listed twice in one match, a result with no winner, a fun mode with fewer than 3 players, and a second confirmation of an already-confirmed match. Each is rejected and stores nothing.
- [ ] Worked examples: one ranked 1v1 from report to confirmation, one casual invite that is declined, and one 3-player merry-go-round. Each shows the stored record.
- [ ] Open questions that need a human answer are listed at the end, not decided silently.

## Boundaries and dependencies

- Documentation only: no app code, no storage implementation and no UI. Those belong to M1.3.
- The document should not choose libraries or a database engine unless a requirement forces it. If it proposes one, it explains why.
- M1.3, M2.x and M3.x depend on this. Changing it later needs both humans to agree.
- `npm test` must still pass, because nothing executable changes.

## Handoff

- Human owners: Niklas and Eric. Both must accept the PR. Eric's acceptance is the cross-review.
- Coder: `coder` subagent (Sonnet), branch `m1.2-data-contract-v2` from `82ebb23`.
- The pull request is #4 in `broccolines/vibecode-workshop-pingpong`. The branch
  `m1.2-data-contract` is a **superseded parallel draft** (PR #2, closed): different record
  shapes, so the two cannot be merged. Do not merge that one.
- Reviewer: `reviewer` subagent (Opus), fresh context.
- Committer: `committer` subagent. It opens the PR in `broccolines/vibecode-workshop-pingpong` and merges only after both humans accept.
- Evidence: `.ai/work/M1.2/validation.md` and `.ai/work/M1.2/review.md`.
