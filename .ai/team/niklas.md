# Niklas — Ladder track (M2)

## Your outcome

A student joins the ranked queue, gets an opponent, plays at the table and sees a confirmed result move both players on the Elo ladder. Stretch goal: a small knockout tournament the whole campus can follow.

## You own

- **Elo ladder.** Ratings come from confirmed `ranked` matches only. Starting rating 1000, K-factor 32 (decided 2026-10-20). Ratings must be reproducible: replaying the confirmed match history gives the same ladder.
- **Ranked queue.** Players join and leave the queue, and two waiting players are paired. You decide what happens to someone who waits alone, and whether pairing considers rating.
- **Result confirmation.** The loser confirms or disputes a reported ranked result. A disputed result never changes ratings.
- **Tournaments.** Single elimination first. An organiser creates one, players join, and results advance the bracket.

## You do not own

- Casual invites and fun modes. These belong to Eric (M3). His matches use the same match record but must never change Elo.
- The shared player and match format. Changing it needs both of you to agree (M1.2, `docs/data-contract.md`).

## Your steps

M2.1 → M2.2 → M2.3 → M2.4. See PLAN.md for the outcomes and dependencies. Start only after M1.3 has merged.

## How you work

1. Open a **milestone lead** session for M2 in your own clone. It writes `.ai/work/M2.x/brief.md` for one step at a time.
2. A **coder** session builds the step on branch `m2.x-short-name` and saves `validation.md`.
3. **Eric's** session (preferably a different AI model) reviews it and writes `review.md`.
4. A **committer** session opens the PR in our fork and merges it after approval.
5. Before closing a session, write a handoff in `.ai/sessions/`.

## Acceptance cases to have ready for your briefs

- Two new players at 1000: the winner goes to 1016 and the loser to 984.
- Equal ratings: the winner gains exactly what the loser loses.
- Upset: a low-rated winner gains more than a high-rated winner would.
- Queue: one player alone waits and is not paired with themselves; a second player joining creates exactly one pairing.
- Leaving the queue removes the player before they are paired.
- A disputed result leaves both ratings unchanged.
- Tournament with an odd number of players: byes are handled and nobody plays twice in a round.
