# M1.2 review

Base SHA: `82ebb237da32c2910fc55fb960a301cd7a92b455` (`main`)
Reviewed head SHAs:
- Round 1: `e52fa1af0bb993dbbb4295be4ea3b6554e15cdb3`
- Round 2: `e8bac4608243c81651a3ea4ff4b2169cd2232990`
- Round 3: the fix commit on `m1.2-data-contract` — recorded below

Reviewer session/provider: opencode subagent, `deepseek-v4.1-flash-free`, in separate sessions
per round. The reviewer did not write the contract. **Honest limitation:** the same model
family was used for every round, so the rounds are independent sessions, not independent
model families. The team brief asks for a different family "where available"; only one
provider was reachable from this environment.

## Round 1 — REQUEST CHANGES

1 blocker, 7 major, 9 minor, 4 nit. Every finding and what changed is listed in
`.ai/work/M1.2/validation.md` under "Round 1 findings and what changed in the document".

The blocker: a casual match created by accepting an invite could never receive its score,
because no endpoint reported a score on a match that already existed. The whole point of this
step is to stop the two tracks from inventing incompatible data, so a gap here would have been
invented twice.

## Round 2 — REQUEST CHANGES

The reviewer re-checked all 21 round-1 findings against the revised document itself (17 FIXED,
4 PARTIALLY FIXED) and found 3 major, 8 minor/nit issues:

| # | Severity | Finding | Fix in this round |
|---|---|---|---|
| N1 | major | The merry-go-round summary match broke §2's own winner/score rules (§4 created a `confirmed` match with no score, and never said what its `playerIds` are). | §2 now states the score exception for that mode; §4 states that the summary match's `playerIds` are the round's participants. |
| N2 | major | A ranked match could never be `proposed`, and the state diagram did not show the real entry point. | The ranked match is created already `reported`; the diagram shows the entry; §2 states that the ranked queue pairing is **not** a match, so the ladder track uses the create route. |
| N3 | major | No persistence seam for invites, rounds, and later queue entries and tournaments — the fun track would have had to edit the frozen store module, the exact collision this contract exists to prevent. | §6 names the collections and gives a generic store API (`list`, `insert`, `find`, `update`, `remove`, `newId`), so a track adds a collection without editing `src/store.mjs`. |
| N4 | minor | An invite did not store the id of the match it created; a round did not store the id of its summary match. | Both records have a `matchId` field. |
| N5 | minor | The change rule cited "AGENTS.md rule 7" for joint ownership; rule 7 is the PR rule. | The citation is now `.ai/team/niklas.md` and `.ai/team/eric.md`. |
| N6 | minor | Several route rows had no precondition, resulting state or refusal code. | Every row in §7 now names them (`400` bad request, `403` wrong actor, `404` unknown id, `409` wrong state). |
| N7 | minor | The evidence named no reviewed head SHA and pointed at a review file that was not in the branch. | Base and head SHAs are stated in the validation file, and this review file is committed with it. |
| N8 | minor | How a per-view stylesheet is loaded was unspecified, and the starter serves only hard-coded assets — a track's stylesheet would not have been reachable. | §8 states that the core serves `public/views/*` and that each view module injects its own `<link>`. |
| N9 | minor | `recomputeRatings(store)` had no defined signature, and its ownership was muddled between M1.3 and M2.1. | §5 gives the exact signature and behaviour, and says M1.3 creates the no-op while M2.1 replaces the file. |
| N10 | nit | The default data directory was a literal `~`, which in the deployed unit (working directory = the release directory) could have written data inside a release. | §6 says the default is resolved with `os.homedir()` and the app fails loudly at boot if it cannot be resolved. |
| N11 | nit | The shape of an empty list was unspecified, and M1.3 has an explicit empty-state case. | §7 says an empty collection is `{"ok": true, "players": []}`, not an error. |

## What was checked, in every round

- That every question PLAN.md M1.2 lists is answered by a named section.
- That the contract contradicts nothing in AGENTS.md, `.ai/rules.md`, PLAN.md,
  `.ai/team/niklas.md` or `.ai/team/eric.md`.
- That the state machine, the route table and the prose agree with each other, per mode, for
  every transition that can actually be reached.
- That the success envelope is unambiguous for every endpoint.
- That §8 really lets two tracks work in parallel on separate clones, and that the file or
  files both tracks would still have to edit are named.
- That nothing in the diff is a credential, an absolute host path, a team URL, a team number
  or an attribution trailer.
- That the diff touches only `.ai/` and `docs/`.

## Not verified, in every round

No browser and no running page: this step is documentation, so there was nothing to exercise.
No container, SSH, deployment or hosted acceptance — the storage rule was compared with
`scripts/deploy.mjs` and `docs/deploy.md`, not with a running service. No Node 22 run (the
suite was run on Node 20.11.1: 21/21 pass).

**No human partner review.** Niklas has not read the contract, so M1.2's agreement gate is
still open. An APPROVE on this document would mean the document is coherent, not that the team
has agreed it.

## Verdict per round

| Round | Head | Verdict |
|---|---|---|
| 1 | `e52fa1a` | REQUEST CHANGES |
| 2 | `e8bac46` | REQUEST CHANGES |
| 3 | the fix commit | pending |
