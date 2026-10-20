# M1.2 validation

- Base SHA: 82ebb237da32c2910fc55fb960a301cd7a92b455
- Reviewed head (round 1): 2739aff72a2b2b7572a953a4fd697d4ce66c2f06
- Head SHA after fix round 1: the commit that contains this file (`git log -1 --format=%H` on branch m1.2-data-contract); it cannot name itself, so the coder handback and review record it.
- Changed: docs/data-contract.md and this file. No code changed.

## Fix round 1

- F1: declined invite stored vs eric.md is now open question Q10 (for Eric), with the current default stated; example 8.2 points to it.
- F2: cancel row reworded; cancel authority is in section 3, and ranked matches (server-created) are cancelled by either participant.
- F3: partial result allowed for running multi-player rounds; partly played rounds can be cancelled by the starter; each elimination updates `updatedAt`.
- F4: decided by Niklas 2026-10-20 (Q11): ranked matches are created only by the server (queue or tournament). Tables and failure cases updated.
- Info: `schemaVersion` is per record; head SHA recorded as above.
- Decisions recorded (Niklas, 2026-10-20): Q1 unique names (renaming stays open), Q4 non-reporter confirms (tables and example updated), Q6 tournament matches are ranked, Q8 score is games won.

## Checks run

- `npm test` on macOS (darwin): 21 tests, 20 pass, 1 fail (deploy lock, "flock is missing"; expected on macOS, unrelated to docs).
- Manual read of docs/data-contract.md for consistency of tables, failure cases and examples with the decisions.

## Not done

- No browser check: no UI changed.
- Not run on Linux. Independent re-review is the reviewer's step.

## Known limitations

- Open: Q3, Q5, Q9.
- Elo formula is deferred to M2.1; only the 1016/984 check is fixed.

## Eric's answers (Eric, fun track, 2026-10-20)

Eric answered the four questions the contract left to the fun track. They are now recorded in
section 9 of the contract as decided, and the text they touch was updated with them:

| Question | Answer | Effect on the document |
|---|---|---|
| **Q1 (rest)** renaming and "me" | Keep the default: renaming is allowed (name rules and uniqueness still apply) and anyone may pick any existing player as "me" — the honour system of section 3. | §9 moved to decided. No other section changes. |
| **Q2** casual and fun confirmation | No confirmation. The report is final for `casual` and fun modes; only `ranked` needs the non-reporter to confirm. | §9 moved to decided. The transition table already had `reported` → `confirmed` happening at the same moment as the report. |
| **Q7** meaning of "invite" | Inside our own app, not 42 intra. 42 intra login stays M5.1. | §9 moved to decided. `externalLogin` in section 1 already reserves the slot. |
| **Q10** declined invites | Keep the `declined` record, but it never counts as a played match: M3.1 hides declined matches from the played-match list. | The `declined` state in section 2, example 8.2 and `.ai/team/eric.md` were reworded to match. Section 2's transition table did not change. |

Still open after these answers: **Q3** and **Q5** (Niklas's), **Q9** (M1.3 verifies the data
location on the guest).

### Checks run after Eric's answers

- Re-read of the changed passages (`declined` in section 2, example 8.2, section 9) against the
  state table, the failure cases and `.ai/team/eric.md`.
- No code changed, so no test run applies.
- The head SHA of this commit cannot name itself; it is recorded in the review file and in the
  PR body.
