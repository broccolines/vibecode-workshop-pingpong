# M1.2 validation

- Base SHA: 82ebb237da32c2910fc55fb960a301cd7a92b455
- Branch and pull request: `m1.2-data-contract-v2`, PR #4 in `broccolines/vibecode-workshop-pingpong`.
  The branch `m1.2-data-contract` (PR #2) is a superseded parallel draft with different record
  shapes; it was closed and is kept as evidence only.
- Reviewed head (round 1): 2739aff72a2b2b7572a953a4fd697d4ce66c2f06
- Head after fix round 1: df0e3f1e7909c518bd37f539691b190dc212c58c
- Head after Eric's answers (round 3): 73abba6a72c75da3c9b777e86fd150c307f0684d
- Head after the round-3 fixes: recorded in the PR body and in `.ai/work/M1.2/review.md`.
- Changed: docs/data-contract.md, PLAN.md, IDEA.md, .ai/team/*.md and this file. No code changed.

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
| **Q1 (rest)** renaming and "me" | Keep the default: renaming is allowed (name rules and uniqueness still apply) and anyone may pick any existing player as "me" — the honour system of section 3. | §9 moved to decided. Section 1's duplicate-name paragraph was reworded so it no longer says renaming and "me" stay open. |
| **Q2** casual and fun confirmation | No confirmation. The report is final for `casual` and fun modes; only `ranked` needs the non-reporter to confirm. | §9 moved to decided. The transition table already had `reported` → `confirmed` happening at the same moment as the report. |
| **Q7** meaning of "invite" | Inside our own app, not 42 intra. 42 intra login stays M5.1. | §9 moved to decided. `externalLogin` in section 1 already reserves the slot. |
| **Q10** declined invites | Keep the `declined` record, but it never counts as a played match: M3.1 hides declined matches from the played-match list. | The `declined` state in section 2, example 8.2 and `.ai/team/eric.md` were reworded to match. Section 2's transition table did not change. |

Still open after these answers: **Q3** and **Q5** (Niklas's), **Q9** (M1.3 verifies the data
location on the guest).

### Round 3 findings and what changed

Round 3 reviewed the commit that recorded Eric's answers (`73abba6`) with a reviewer from a
different model family, and returned REQUEST CHANGES: one major, three minor and two nit
findings. What changed in this revision:

- **Major** — section 1 still said renaming and picking "me" stay open, which contradicted
  section 9. Reworded: section 1 now records both decisions (Niklas on uniqueness, Eric on
  renaming and "me") and points to section 9.
- **Minor** — the `declined` wording in section 2 and example 8.2 said the record "leaves no
  trace" while also calling it "kept as history", and section 2 read as if the visibility
  decision were still open. Reworded: the record is kept as history and does not appear in
  the played-match list, and M3.1 implements that hiding.
- **Minor** — the head SHA claim was anticipatory. The file now names the head of fix round 1
  (`df0e3f1`), the head after Eric's answers (`73abba6`) and states that the newest head is
  recorded in the review file and the PR body.
- **Minor** — `.ai/team/niklas.md` and `PLAN.md` still said "the loser confirms", while the
  contract says the participant who did **not** report confirms. Both lines now name the
  contract's rule and say that in practice this is the loser, since the winner reports.
- **Minor** — the review file and the brief called the old branch name the "tip of
  `m1.2-data-contract`". Both now name the branch `m1.2-data-contract-v2` and PR #4, and
  state that the other branch is a superseded draft that was closed.
- **Nit** — section 9's open-question list did not give Q9's default. It now does.
- **Nit** — `IDEA.md` still said "confirm with Eric" about the meaning of "invite". It now
  records that Eric confirmed it and that 42 intra login stays M5.1.
- **Nit** — the status line claimed "both humans accepted it". It now says Niklas accepted
  and Eric answered the four fun-track questions, with the answers recorded in section 9.

### Checks run after Eric's answers

- Re-read of the changed passages (`declined` in section 2, example 8.2, section 9) against the
  state table, the failure cases and `.ai/team/eric.md`.
- No code changed, so no test run applies.
- The head SHA of this commit cannot name itself; it is recorded in the review file and in the
  PR body.
