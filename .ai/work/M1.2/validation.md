# M1.2 — Validation

Recorded by the M1 milestone lead session on 2026-10-20. Documentation-only step: no runtime
behaviour changed, so no journey was exercised. Connection details are left out on purpose.

## What was checked

| Check | Result |
|---|---|
| `git log --all -- docs/data-contract.md` before the step | empty — no branch had the file yet |
| `npm test` on `main` | 21 tests, 21 pass, 0 fail, 0 skipped (Node v20.11.1 locally) |
| `npm test` with Node 22 (`npx -y node@22 --test`) | not run for this step — the step changed no executable file |
| Contract against PLAN.md M1.2 questions | every question is answered in a named section (§1–§7) |
| Contract against AGENTS.md and `.ai/rules.md` | no conflict found; storage rules match `scripts/deploy.mjs` (`assertReleaseIsolated`) |
| Contract against `.ai/team/niklas.md` and `.ai/team/eric.md` | field ownership matches both briefs |

## Review rounds

Base SHA: `82ebb23` (`main`). Reviewed head SHAs: `e52fa1a` (round 1) and `e8bac46` (round 2).

| Round | Reviewer | Head SHA | Verdict |
|---|---|---|---|
| 1 | opencode subagent, deepseek-v4.1-flash-free | `e52fa1a` | REQUEST CHANGES — 1 blocker, 7 major, 9 minor, 4 nit |
| 2 | opencode subagent, deepseek-v4.1-flash-free | `e8bac46` | REQUEST CHANGES — 3 major, 8 minor/nit |
| 3 | opencode subagent, deepseek-v4.1-flash-free | the fix commit | see `.ai/work/M1.2/review.md` |

Round 1 findings and what changed in the document:

- **Blocker** — a casual match created by accepting an invite could never receive its score,
  because no endpoint reported a score on an existing match. Fixed: `POST /api/matches/:id/report`
  added (§2, §7) with the mode-specific resulting state.
- **Major** — the success envelope contradicted itself. Fixed: one envelope for every endpoint
  (§7), with the payload keys listed per endpoint.
- **Major** — the "route registry" was unnamed and the obvious candidate was frozen shared
  code. Fixed: route modules are auto-discovered from `src/routes/`, so adding a route file
  needs no shared edit (§8).
- **Major** — no seam for rating derivation after the core was frozen. Fixed:
  `src/domain/ratings.mjs` is a ladder-track slot, a no-op in M1.3, called by the shared core
  after every match write (§5).
- **Major** — ranked matches allowed three or more participants. Fixed: ranked and casual
  require exactly two; merry-go-round needs three or more and is created only by the round
  route (§2, §4).
- **Major** — winner and score did not constrain each other. Fixed: `score` keys are exactly
  `playerIds`, `winnerId` must be the unique highest games-won, a tie is refused (§2).
- **Major** — `public/style.css` was shared but tracks were not allowed to edit it. Fixed:
  per-track stylesheets (§8).
- **Major** — `src/domain.mjs` was frozen with no documented call surface. Fixed: the shared
  call surface is listed and each track's own rules live in its own domain file (§8).
- **Minor** — the state diagram omitted the casual and invite edges. Fixed: the diagram is
  now per mode (§2).
- **Minor** — `reportedBy` was mandatory on a `proposed` match. Fixed: `string or null` (§2).
- **Minor** — the confirmation rule contradicted PLAN.md M2.3 ("the loser confirms or
  disputes"). Fixed: only the **winner** may report, the loser confirms or disputes (§2).
- **Minor** — the create route did not state the resulting state, and merry-go-round had two
  sources of truth. Fixed: the create route states the resulting state per mode and rejects
  `merry-go-round`; the round route is the only writer of the summary match (§2, §4, §7).
- **Minor** — names could be edited but no endpoint existed. Fixed: names are fixed once
  created; the promise was removed (§1).
- **Minor** — state-changing endpoints had no preconditions. Fixed: §7 states the status
  codes and that every refused transition stores nothing.
- **Minor** — §9 was missing two never-break rules. Fixed: rules 2 and 3 added (§9).
- **Minor** — `rating` was both stored and derived with no authority rule. Fixed: the stored
  value is a cache, the replay is the truth (§5).
- **Minor** — no validation evidence existed for the step. Fixed: this file.
- **Nit** — "rule G4" did not exist. Fixed: the citation is now AGENTS.md rule 2 (§Change rule).
- **Nit** — id collisions had no rule. Fixed: the store regenerates a colliding id (§1, §6).
- **Nit** — replay order and timezone were unspecified. Fixed: UTC timestamps, replay ordered
  by `confirmedAt` then match id (§2, §5).
- **Nit** — §9 rule 7 was stricter than the platform contract. Fixed: `0.0.0.0` **or**
  `127.0.0.1` (§9).

### Round 2 findings and what changed

Round 2 re-checked all 21 round-1 findings against the revised document (17 FIXED, 4 PARTIALLY
FIXED) and found new issues. What changed in this revision:

- **Major** — the merry-go-round summary match violated §2's own winner/score rules. Fixed:
  §2 states the score exception for that mode explicitly, and §4 states that the summary
  match's `playerIds` are the round's participants.
- **Major** — a ranked match could never exist in `proposed`, and the diagram did not show the
  real entry. Fixed: the ranked match is created already `reported`, the diagram shows that
  entry, and §2 states that the ranked queue pairing is **not** a match, so the ladder track
  creates ranked matches through the create route.
- **Major** — no persistence seam for invites, rounds, queue entries or tournaments. Fixed:
  §6 now names the collections and gives the generic store API (`list`, `insert`, `find`,
  `update`, `remove`, `newId`), so a track adds a collection without editing `src/store.mjs`.
- **Minor** — an invite did not store the id of the match it created, and a round did not
  store the id of its summary match. Fixed: both records have a `matchId` field.
- **Minor** — the change rule cited "AGENTS.md rule 7" for joint ownership, which is the PR
  rule. Fixed: the citation is now `.ai/team/niklas.md` and `.ai/team/eric.md`.
- **Minor** — some route rows had no precondition, resulting state or refusal code. Fixed:
  every row in §7 now names them, including `403` for a wrong actor and `409` for a wrong
  state.
- **Minor** — the evidence named no reviewed head SHA and pointed at a review file that was
  not in the branch. Fixed: base and head SHAs are stated here and `.ai/work/M1.2/review.md`
  is committed.
- **Minor** — how a per-view stylesheet is loaded was unspecified, and the starter serves only
  hard-coded assets. Fixed: §8 states that the core serves `public/views/*` and that each
  view module injects its own `<link>`.
- **Minor** — `recomputeRatings(store)` was under-specified and its ownership muddled.
  Fixed: §5 gives the exact signature and behaviour, and says M1.3 creates the no-op while
  M2.1 replaces the file.
- **Nit** — the default data directory used a literal `~`. Fixed: §6 says it is resolved with
  `os.homedir()` and that the app fails loudly at boot if it cannot be resolved, because the
  deployed unit's working directory is the release directory.
- **Nit** — the shape of an empty list was unspecified. Fixed: §7 says an empty collection is
  `{"ok": true, "players": []}`, not an error.

## Not verified

- No browser, no container, no SSH, no deployment: this step changed no executable code.
- No `npm test` run with Node 22 for this step (nothing executable changed).
- **No human partner review.** Niklas has not read the contract; the agreement gate for M1.2
  is still open, and the document says so.
- The M1.3 implementation was started against the first version of this contract and needs a
  fix round against the revised one.
