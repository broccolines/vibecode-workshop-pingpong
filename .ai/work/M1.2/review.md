# M1.2 review

Base SHA: 82ebb237da32c2910fc55fb960a301cd7a92b455
Head SHA: 2739aff72a2b2b7572a953a4fd697d4ce66c2f06 (confirmed as the tip of `m1.2-data-contract` with `git rev-parse HEAD`)
Reviewer session/provider: Claude Code subagent, Opus (Claude model family; fresh session that did not write the change). The coder was also Claude (Sonnet), so this is not a cross-family review.
Date: 2026-10-20

## What I checked

- Scope: `git diff --name-only 82ebb23..2739aff` lists only `.ai/work/M1.2/brief.md`, `.ai/work/M1.2/validation.md` and `docs/data-contract.md`. No code changed. Two commits: 20a97fb (brief) and 2739aff (contract and validation).
- Read the whole diff, plus IDEA.md, PLAN.md, `.ai/rules.md`, `.ai/team/niklas.md` and `.ai/team/eric.md`, to check consistency.
- `npm test` re-run on macOS: 21 tests, 20 pass, 1 fail ("deploy lock ... flock is missing"). This matches the claim in validation.md. The failing test and `scripts/` are not touched by this diff, so the failure comes from the environment and not from this step. I did not run it on Linux.
- Leak scan of the diff (IPs, tokens, secrets, private paths, attribution lines): nothing found. The only path is `~/.local/share/vibecode-workshop/data/`, which comes from `.ai/rules.md`. The commits have no trailers.
- Browser: not applicable (no UI). **Not verified** in a browser, because nothing exists to verify.

| Acceptance item | Where in docs/data-contract.md | Result |
|---|---|---|
| Player: stable ID, name, empty external login, createdAt, duplicate-name rule, name validation | §1 lines 11–28 (trim and collapse, 1–30 chars, no control chars, case-insensitive uniqueness; Q1) | Met |
| Match: extensible mode, participants as IDs (2+), states and transitions incl. declined/cancelled, 1v1 score and multi-player eliminations, timestamps | §2 lines 32–96 | Met, with F2 and F3 |
| Authority per mode; honour system stated | §3 lines 98–119 (loser-only confirm and dispute; honour system on line 100) | Met, with F2 |
| Ownership; Elo derived only from confirmed ranked | §4 lines 121–126, §5 lines 128–147 (exact `mode = ranked` filter, replay order, cache must be rebuildable) | Met |
| Storage: location/env, survives redeploy, no lost concurrent writes, requirement rather than implementation | §6 lines 149–161 | Met |
| Failure cases: nonexistent player, duplicate participant, no winner, fun mode < 3, second confirmation; each rejected and stores nothing | §7 lines 163–181; "rejected" defined on line 7 | Met |
| Worked examples: ranked report → confirm, declined casual, 3-player merry-go-round, each with stored record | §8 lines 183–252 | Met, but F1 conflicts with 8.2 |
| Open questions listed, not silently decided | §9 Q1–Q9 | Partly: F1 and F4 are decisions not listed |

Internal consistency checks done by reading:
- Ranked: walked 8.1 through the transition table: (new)→proposed, proposed→reported, reported→confirmed by loser. `decidedBy`, `reportedAt` and `confirmedAt` are consistent. 1016/984 is consistent with K = 32 at equal ratings.
- Casual: walked 8.2: (new)→proposed, proposed→declined by the invitee. Consistent with §3.
- Merry-go-round: walked 8.3: (new)→accepted, eliminations appended, accepted→reported→confirmed at once. Placings derive correctly from the reversed eliminations. Consistent apart from F3.
- Elo isolation: §4 and §5 both require the exact `ranked` + `confirmed` filter. Casual and fun auto-confirm cannot leak into ratings, because the filter is on mode and not on state alone. This is sound.
- Brief failure cases vs §7: all five present.

## Findings

**F1 — Medium. A conflict with Eric's track brief is decided silently. docs/data-contract.md:76, :227–237; .ai/team/eric.md:35.**
- eric.md lists the acceptance case "A declined invite records no match." The contract stores a declined invite as a match record (`state: "declined"`, example 8.2) and says "The record stays as history".
- This is not among Q1–Q9. Line 237 calls only list visibility a UI choice.
- Failing case: in M3.1, Eric's milestone lead writes "declined invite → match count unchanged" from eric.md, and the M1.3 code following this contract fails it, or the reverse.
- Required outcome: either add an open question (e.g. Q10: "Is a declined invite kept as a `declined` match record, or does it leave no match? eric.md currently says no match") for Eric to answer, or reword so both documents agree. Example: "records no result and never appears in match history or ratings", plus a note that eric.md needs to align. The humans decide which; the contract must not decide it silently.

**F2 — Low. The cancel authority for ranked matches contradicts itself. docs/data-contract.md:88 vs :109 and :262.**
- The transition table says `proposed`/`accepted` → `cancelled` applies to "all" modes with the meaning "Creator withdraws". A queue-paired ranked match has `createdBy: null` (line 40, example 8.1), so it has no creator who could withdraw.
- §3 line 109 and Q5 say "either participant" may cancel a ranked match.
- Failing case: an implementer following line 88 makes queue-paired ranked matches impossible to cancel.
- Required outcome: make line 88 match §3. For example: "Withdrawn before a result is reported; who may do it is in §3."

**F3 — Low. The merry-go-round in-progress `result` contradicts the field rule. docs/data-contract.md:41 vs :65 and :241.**
- Line 41 says `result` is "`null` until a result is reported".
- Line 65 and example 8.3 say a running round holds `{ "eliminations": [...] }` while the state is still `accepted`.
- Related gaps:
  - "Cancelled — withdrawn before a result was reported" (line 77, line 88) leaves open whether a round with partial eliminations can still be cancelled.
  - "`updatedAt` changed on every transition" (line 46) does not say whether appending an elimination, which is not a state transition, updates it.
- Required outcome: one sentence on line 41 allowing a partial result for multi-player modes in `accepted`. Then state whether a partly played round can be cancelled and whether each elimination updates `updatedAt`.

**F4 — Low. Direct ranked challenges outside the queue are introduced without being listed. docs/data-contract.md:86, :106.**
- PLAN.md and niklas.md describe ranked matches as coming from the queue (and tournaments).
- The contract also lets either participant create a ranked match directly against any named player, with no acceptance step ("or by being named"). That is a product decision on Niklas's track.
- It is reasonably safe, because the loser must still confirm. But it is not among the open questions.
- Required outcome: add it to Q5 or a new question for Niklas: "May a player create a ranked match directly, without the queue, and without the opponent accepting?"

**Info (no change required):**
- `schemaVersion` (line 159) does not say whether it sits per record or per store. It is absent from the §1 player example and from both field tables. M1.3 can settle this, but one clause would help.
- validation.md does not record the head SHA. It says the SHA is in the handback. AGENTS.md rule 5 asks evidence to state base and head SHAs; this review records them.
- Replay ties are broken by opaque random `id` (line 124). This is deterministic, but the order is arbitrary. Acceptable.

## Verdict

**REQUEST CHANGES** for 2739aff72a2b2b7572a953a4fd697d4ce66c2f06.

The contract is strong. It states requirements rather than implementation and keeps Elo strictly tied to confirmed ranked matches. It supports 3+ participants, covers every failure case in the brief, and its worked examples agree with the transition table.

It fails the brief's last acceptance item ("open questions ... not decided silently"). It silently settles F1, a direct contradiction with eric.md's acceptance case, and F4. F2 and F3 are small internal inconsistencies that an implementer of M1.3 would hit.

All four are wording changes to `docs/data-contract.md`, and possibly a note in validation.md. Any new SHA needs re-review.

## Round 2

Base SHA: 82ebb237da32c2910fc55fb960a301cd7a92b455
Head SHA: df0e3f1e7909c518bd37f539691b190dc212c58c (confirmed as the tip of `m1.2-data-contract` with `git rev-parse HEAD`). Previous head: 2739aff72a2b2b7572a953a4fd697d4ce66c2f06.
Reviewer session/provider: Claude Code subagent, Opus (fresh session; not the coder). Same model family as the coder (Claude), so this is not a cross-family review.
Date: 2026-10-20

### What I checked

- Scope: `git diff --name-only 2739aff..df0e3f1` lists only `docs/data-contract.md` and `.ai/work/M1.2/validation.md`. The full range base..head still touches only those two files plus the brief. No code changed.
- I read the whole of `docs/data-contract.md` at df0e3f1 again, against every acceptance item in the brief. I also cross-read `.ai/team/eric.md` and `.ai/team/niklas.md`.
- `npm test` re-run on macOS: 21 tests, 20 pass, 1 fail. The failure is the same environment-only one as before: deploy lock, "flock is missing". Not run on Linux.
- Leak scan of the base..head diff and the commit messages (tokens, IPs, `/Users/`, attribution or generated-by lines): nothing found.
- Browser: not applicable (no UI). **Not verified** in a browser.

Round-1 findings:

| Finding | Resolution at df0e3f1 | Result |
|---|---|---|
| F1: declined invite vs eric.md:34 | Q10 (docs/data-contract.md:275) is open, owned by Eric, states the current default (kept as a `declined` record) and the alternative, and says which documents change in each case. Example 8.2 (line 240) points to Q10 and quotes eric.md. Nothing is decided silently any more. | Resolved |
| F2: cancel authority for ranked | Line 89 now says "who may do it is in section 3". Line 110 says either participant may cancel a ranked match, because ranked matches have no creator. | Resolved |
| F3: partial result for merry-go-round | Line 41 adds an exception for a running multi-player round in `accepted`. Line 46 says every appended elimination updates `updatedAt`. Line 89 lets the starter cancel a partly played round until the winner is determined. Line 65 and example 8.3 (line 244) agree. | Resolved |
| F4: direct ranked challenge | Decided by Niklas as Q11. Recorded consistently at line 83 (only the server creates), line 87, line 107 (Create), line 181 (a client creating a ranked match is rejected), line 263, and example 8.1 (`createdBy: null`). | Resolved |
| Info: `schemaVersion` placement | Line 161 puts it on every record. Line 188 explains why the examples omit it. Validation records the base and round-1 heads. | Resolved |

Recorded decisions (taken as given; I checked only that they are recorded consistently):

- **Q1:** unique names, case-insensitive, compared after clean-up. See lines 20, 183 and 261. Rename and "me" stay open (line 269, with a default). Line 14 "May be changed later" fits the rename default.
- **Q4:** the non-reporter confirms. See lines 75, 91, 93, 112–113, 118–119, 179, 215 and 262. In example 8.1 Anna reports and Ben confirms; `decidedBy` is `p_ben`.
- **Q6:** tournament matches are ranked. See lines 83, 141 and 264.
- **Q8:** a score is games won. See lines 57 and 265. Example 2-1 matches.
- **Q11:** see F4 above.

Contract walk-through:

- Ranked: (new)→proposed (server), proposed→reported, then reported→confirmed or disputed by the non-reporter. A dispute leads to reported or cancelled. The cancel authority in section 3 covers both `proposed` and `disputed`. `accepted` never occurs for ranked, which is harmless under the "all" cancel row.
- Casual: (new)→proposed by the inviter. The invitee accepts or declines; the inviter cancels. Then accepted→reported→confirmed automatically.
- Merry-go-round: (new)→accepted. Eliminations are appended. When n−1 eliminations exist the round goes reported→confirmed. Placings in example 8.3 are correct.
- Elo isolation is unchanged and sound: there is an exact `mode = ranked` + `state = confirmed` filter (lines 126–127 and 148). Casual and fun matches cannot move ratings.
- Failure table (lines 169–184): all five cases from the brief are present, plus additions consistent with the decisions (client-created ranked match rejected; confirm or dispute by the reporter rejected).
- Open questions Q1 (rest), Q2, Q3, Q5, Q7, Q9 and Q10 are each genuinely undecided in the text and each states a default.

### Findings

No blocking findings. Info only (no change required for this step):

- **I1:** `.ai/team/niklas.md:11` still says "The loser confirms or disputes". The contract records Niklas's Q4 decision that the non-reporter confirms. The contract governs. niklas.md should be aligned when Niklas's track brief is next touched (for example in the M2.3 brief), so that the M2.3 acceptance cases are not written from the stale line.
- **I2:** Q3 (line 271) asks "or may either player cancel it?". For a `proposed` ranked match this is already allowed by the Q5 default (line 110). For a `proposed` casual match the inviter can already cancel and the invitee can decline. The open part is really timeouts, and the fate of a `reported` ranked match that the confirmer ignores. Q3 also names no owner, unlike the other questions. These are wording points only.
- `npm test` is not green on macOS because `flock` is missing. This is outside this step's diff. Linux was not checked.

### Verdict

**APPROVE** for df0e3f1e7909c518bd37f539691b190dc212c58c.

- All round-1 findings are resolved in the committed diff.
- Every acceptance item in the brief is met and can be checked by reading the document.
- The five recorded decisions appear consistently across transitions, the authority table, the failure cases and the worked examples.
- The remaining open questions are genuinely open, each with a default.

Approval covers only this SHA. Under the brief, merging still needs both Niklas and Eric to accept the PR; Eric's answer to Q10 may change section 2 and example 8.2, and any such change needs re-review.

## Round 3 (cross-family, Eric's session)

Eric's session (opencode, deepseek) reviewed 73abba6, and its findings were addressed in 00512b4 by commit author estulik. The reviewer's own text is not on disk; only the coder's summary in validation.md exists. This round is therefore recorded here as unverified, and no verdict is attributed to it.

## Round 3

Note on naming: the branch already contains a "Round 3" and a "Round 4" heading in
`.ai/work/M1.2/review.md`, both written by the coder session (see F1). The lead asked for this
section to be called "Round 3". When it is copied into review.md, please renumber it so the
history reads in order.

- Base (last approved): 33f0c75204f4474317f657a473de2d585f3a4c03 (approved contract df0e3f1 plus the review commit)
- Head I was asked to review: 73abba6a72c75da3c9b777e86fd150c307f0684d
- **Branch tip after `git fetch origin`: 00512b46fcd057b24471970299d5f90bb38a0fc2.** Another
  session pushed "docs(M1.2): address round-3 review findings in the data contract" while I was
  reviewing. I reviewed both commits. The verdict below applies to each one separately.
- M1.3 head checked: origin/m1.3-first-match = 2afed9cef4fef43de4584ae4ae742ac40cbfa8c9 (code as approved at c9f34f6; later commits touch only evidence and the PR description)
- Reviewer: Claude Code subagent, Opus (Claude family, fresh session, not the coder). Read-only
  with git show, diff and merge-tree. No checkout or branch switch.
- Date: 2026-10-20

### What I checked

- `git diff 33f0c75..00512b4` in full: the contract, eric.md, niklas.md, brief, review,
  validation, IDEA.md and PLAN.md. No code changed.
- The whole of `docs/data-contract.md` at 00512b4. I checked Eric's answers against the state
  table, the transitions, the §3 authority table, the §4 Elo filter, the §5 ownership table, the
  §7 failure table and examples 8.1–8.3.
- Niklas's decisions Q1 (uniqueness), Q4, Q6, Q8 and Q11: their lines in §1, §3 and §9 are byte-identical to 33f0c75. The only change is "Decided by Niklas" → "Uniqueness decided by Niklas" in the §1 note. niklas.md and PLAN.md M2.3 were reworded *toward* Q4, not away from it.
- Open questions: Q3, Q5 and Q9 remain. Each states a default and an owner. Q2, Q7, Q10 and Q1 (rest) left the open list and were recorded as decided. Nothing else was silently decided.
- Leak scan of the diff and commit messages for `/Users/`, keys, tokens, IPs and
  attribution, generated-by or session lines: none found. The authors are `estulik`.
- M1.3 conformance: I read `lib/ladder.mjs`, `lib/store.mjs`, `server.mjs` and
  `public/app.js` at origin/m1.3-first-match.
- Textual conflict: `git merge-tree --write-tree` of origin/m1.3-first-match with 00512b4 gives a clean tree (780555652b…, exit 0). With 73abba6 it also gives a clean tree (94919374…, exit 0). The two branches change no files in common since 33f0c75.
- `npm test`: not run. No code changed in this range.
- Browser: not applicable, because there is no UI change. **Not verified.**

### Contract consistency (Eric's answers)

| Answer | Where it lands | Consistent? |
|---|---|---|
| Q1 rest (renaming allowed, anyone picks "me") | §1 line 20 "May be changed later", §1 line 26, §3 honour system line 107, §7 "already taken" line 189, §9 line 278 | Yes at 00512b4. **No at 73abba6:** line 24 still said "Renaming and picking "me" stay open in Q1", which contradicted §9. Fixed in 00512b4. |
| Q2 (no confirmation for casual/fun) | §2 transition at line 98, §3 Confirm row line 118 ("Automatic"), example 8.3 | Yes |
| Q7 (invite inside the app) | §1 `externalLogin`, §9 line 280, IDEA.md, eric.md | Yes |
| Q10 (declined kept, never a played match, hidden by M3.1) | §2 state table line 82, §4 line 133, transitions 94 and 103, example 8.2 lines 246–249, §9 line 281, eric.md acceptance case | Yes at 00512b4. At 73abba6, example 8.2 said "leaves no trace" and also "kept as history". Fixed. |

### Findings

- **F1: Major (evidence integrity). `.ai/work/M1.2/review.md:78-99` at 00512b4.** The coder session inserted "## Round 3 — Eric's answers" (line 83) and "## Round 4" (line 91) *between* the Round 2 heading and the Round 2 body. As a result, the Round 2 Opus body is now filed under "## Round 4": its reviewer line, its "What I checked" section (line 99) and its "**APPROVE** for df0e3f1…" (line 142).
  - Line 94 says "Reviewer: opencode subagent, `deepseek-v4.1-flash-free`. Verdict: see the table at the bottom". There is no such table. The text at the bottom is the earlier Opus APPROVE of df0e3f1.
  - A reader would therefore conclude that 00512b4 was approved by a cross-family reviewer. No such review is on disk.
  - The round-3 deepseek review is summarised only by the coder. Its own text is not recorded. The summary is also inconsistent: review.md:87 says "one major and seven smaller findings", while validation.md says "one major, three minor and two nit" and then lists 1 major, 4 minor and 3 nit.
  - The coder also rewrote the round-1 reviewer's attestation at review.md:4 ("confirmed as the tip of `m1.2-data-contract-v2`") and the round-2 attestation at line 81. Those are other reviewers' signed statements. They should stay as written, with any correction appended.
  - **Required:**
    1. Restore the round-1 and round-2 sections exactly as they were at 33f0c75.
    2. Append later rounds after the round-2 verdict.
    3. Record the round-3 cross-family review in the reviewer's own words, with its SHA and verdict.
    4. Remove the "Round 4" placeholder until a reviewer has actually written it.
  - Per CLAUDE.md, review.md is the reviewer's record, and the coder should not edit it.
- **F2: Nit. `docs/data-contract.md:3-9`.** The paragraph has a broken hard wrap ("merges. Changing it afterwards" / "needs"). The binding condition also changed from "when both accept the PR" to "when this PR merges". That matches the brief only because the committer merges after both humans accept, and the human said Niklas decides for both. This is acceptable, but the status line could say so in one sentence.
- **F3: Nit. `docs/data-contract.md:270-274`.** Niklas's decided list is ordered Q1, Q4, Q11, Q6, Q8. This is cosmetic.
- **F4: Info (future steps, no change required now).** Q1 (rest) allows renaming. The uniqueness rule says nothing about renaming to a case-variant of your *own* name (for example "anna" → "Anna"). The step that adds rename should state that the player's own record is excluded from the collision check.

### M1.3 against 00512b4

Nothing in 73abba6 or 00512b4 makes the M1.3 implementation non-conformant:

- **Q9 default** ("`DATA_DIR` overrides …, resolved with `os.homedir()`, fails visibly"): `lib/store.mjs:9-11` uses `env.DATA_DIR || join(homedir(), '.local/share/vibecode-workshop/data')`. `Store.open` creates the directory and does a test write. The server refuses a DATA_DIR inside the app directory at `server.mjs:94`. This conforms.
- **Q2** (casual report final, no confirmation): `lib/ladder.mjs:39-80` stores the casual match as `confirmed`, with `reportedBy`, `reportedAt` and `confirmedAt` set at once. This agrees with the decision. Separately, M1.3 skips the (new)→proposed→accepted→reported path for casual. That shortcut was already approved in M1.3 against the same transition table, and 73abba6 does not change the table.
- **Q1 rest**: M1.3 has no rename. That is allowed, not required. `public/app.js` lets anyone pick any player as "me", which is the honour system as decided.
- **Q10**: M1.3 cannot create `declined` records. `public/app.js` `render()` lists every match regardless of state, which is harmless today. M3.1 must filter declined matches out of the played-match list, as the contract now assigns.
- **Q4/Q11**: `recordMatch` rejects a client-created `ranked` match with 403. This is unchanged.

**Textual merge:** clean. There are no common files, and merge-tree exits 0 for both 73abba6 and 00512b4 against origin/m1.3-first-match. Merge order does not matter textually.

### Verdict

- **73abba6: REQUEST CHANGES.** §1 line 24 contradicts §9 (renaming and "me" are "still open" there but decided here). Example 8.2 says both "leaves no trace" and "kept as history". Both are superseded by 00512b4.
- **00512b4: REQUEST CHANGES, for the evidence file only (F1).** The contract text at 00512b4 is internally consistent. Eric's four answers are applied across the state table, the authority table, the failure cases, the examples and the ownership table. Niklas's Q1, Q4, Q6, Q8 and Q11 are unaltered. The open questions Q3, Q5 and Q9 are honest and have defaults. There are no secrets or attribution lines. I would approve the contract content as-is. The blocker is that `.ai/work/M1.2/review.md` now misfiles the Round 2 APPROVE under a "Round 4" deepseek heading and points to a verdict table that does not exist. Restoring that file is the only change needed, and it requires no contract change. Any new SHA needs re-review. It can be a quick check that `docs/data-contract.md` is unchanged from 00512b4.
- M1.3 stays conformant and merges cleanly on top of either SHA.
