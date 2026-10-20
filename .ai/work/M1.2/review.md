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
