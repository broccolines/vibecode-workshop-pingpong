# Project plan

Agreed with Niklas on 2026-10-20. Eric confirms when he pulls it. Step IDs are permanent; new work gets new IDs.

## Goal

Students at 42 Heilbronn can find an opponent, play at the campus table and see a trusted result on a shared ladder, all at our team's live URL. See IDEA.md.

## Working model

Project lead → milestone lead → one step at a time through coder → independent reviewer → committer.

There are two humans and two tracks:

| Track | Human owner | Scope | Brief |
|---|---|---|---|
| Ladder (L) | Niklas | Elo ladder, ranked queue, tournaments | [.ai/team/niklas.md](.ai/team/niklas.md) |
| Fun (F) | Eric | Casual invite matches, merry-go-round, other fun modes | [.ai/team/eric.md](.ai/team/eric.md) |

**Sequencing.** M1 is shared and runs with one milestone lead. Both tracks depend on its player and match format, so nobody starts M2 or M3 until M1.3 has merged. After that, M2 and M3 run **in parallel**. Each has its own milestone lead and its own clone (copy of the repo). This departs from the starter's "one milestone lead at a time" rule. Accepted on 2026-10-20.

**Cross-review.** Eric's sessions review Niklas's steps and Niklas's sessions review Eric's. Each human then sees the other track's code and the shared format stays consistent.

## M1 — Shared foundation (joint)

Milestone lead: assign a fresh session. Release: after both humans accept the journey at the live URL.

| Step | Outcome | Depends on | Human owner | State / PR |
|---|---|---|---|---|
| M1.1 | Our fork runs at the assigned URL and reports its deployed revision | Team access | Niklas | draft |
| M1.2 | Shared format agreed and written down: player, match, result, mode | M1.1 | both | draft |
| M1.3 | A visitor can join as a player and record a one-on-one match result; it survives reload, a second visitor and a restart | M1.2 | Eric | draft |
| M1.4 | Both humans complete the journey on phones; observed problems are fixed or added as new steps | M1.3 | both | draft |

### M1.1 — The live starting point

- [ ] Both humans have access to the team fork `broccolines/vibecode-workshop-pingpong`.
- [ ] The assigned SSH connection reaches our team environment.
- [ ] The page is reachable at the assigned HTTPS URL.
- [ ] `/api/health` reports the revision we intended to deploy.
- [ ] The other teammate opens the page on a phone.

### M1.2 — Shared format

This step produces a written agreement in `docs/data-contract.md`, reviewed by both humans, with little or no code. It must answer:

- What identifies a player. Each player needs a stable internal ID that is separate from the display name, plus a place for a later external login (42 intra) that the demo leaves empty. Matches and ratings refer to the ID, never to the name. Can two players have the same name?
- What a match is: its mode (`ranked`, `casual`, fun modes), its participants (2 or more), its state (proposed, reported, confirmed, disputed), the score or placings, and its timestamps.
- Who may report a result and who must confirm it.
- Which track owns which fields. Ratings are derived from confirmed `ranked` matches only.
- Where data is stored on the server, so that it survives a redeploy (see `.ai/rules.md`).

### M1.3 — First recorded match

- [ ] Normal case: two players are created, a 2–1 result is recorded, both players see it after reloading and on another device.
- [ ] Empty state: with no players or matches, the page explains what to do first.
- [ ] Failure case: reporting a match against a nonexistent player, or a match with no winner, is refused with a clear message and stores nothing.
- [ ] Restart: the data is still there after the app restarts.

## M2 — Ladder track (Niklas)

Planned after M1.2 is agreed. Draft outcomes:

| Step | Outcome | Depends on | Human owner | State / PR |
|---|---|---|---|---|
| M2.1 | Confirmed ranked matches update both players' Elo; the ladder page shows ranks | M1.3 | Niklas | draft |
| M2.2 | A player joins the ranked queue and is paired with a waiting player; both see who to play | M2.1 | Niklas | draft |
| M2.3 | The player who did not report confirms or disputes a reported ranked result (in practice the loser); only confirmed results change ratings | M2.1 | Niklas | draft |
| M2.4 | An organiser creates a single-elimination tournament; results advance the bracket | M2.3 | Niklas | draft |

## M3 — Fun track (Eric)

Planned after M1.2 is agreed. Draft outcomes:

| Step | Outcome | Depends on | Human owner | State / PR |
|---|---|---|---|---|
| M3.1 | A player invites a named player to a casual match; the invitee accepts or declines | M1.3 | Eric | draft |
| M3.2 | Casual results are recorded and visible but never change Elo | M3.1 | Eric | draft |
| M3.3 | Merry-go-round: 3 or more players start a round, eliminations are recorded, a winner is shown | M1.3 | Eric | draft |
| M3.4 | One more fun mode, chosen by Eric after M3.3 | M3.3 | Eric | draft |

## M4 — Demo

Joint. Both tracks are merged and deployed on the team's release instruction. One end-to-end run is done on phones: queue → play → confirm → ladder, then invite → casual, then merry-go-round.

## Later (not planned yet)

| Step | Outcome | Depends on | Human owner | State / PR |
|---|---|---|---|---|
| M5.1 | A player signs in with 42 intra and is linked to their existing player record, keeping their matches and rating | M1.3 | unassigned | idea |

M5.1 needs an app registered with 42 and a secret stored on the server, outside the repo.

## Decisions (2026-10-20)

1. Real table tennis, played in person on campus.
2. Simple player name for the demo. The player format is built so 42 intra login can be added later (see M1.2, M5.1).
3. Elo starts at 1000 with a K-factor of 32.
4. M2 and M3 run in parallel after M1.3, with cross-review between the two humans' sessions.
