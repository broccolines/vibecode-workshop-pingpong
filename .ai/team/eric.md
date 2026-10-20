# Eric — Fun track (M3)

## Your outcome

A student invites a friend to a casual match without risking their rating, and a group at the table can run a merry-go-round round ("Rundlauf") and see who won. These modes keep people coming to the table when they don't feel like playing ranked.

## You own

- **Casual invites.** A player invites a named player, and the invitee accepts or declines. Results are recorded as `casual` and **never** change Elo.
- **Merry-go-round.** Three or more players start a round, eliminations are recorded in order, and a winner is shown.
- **Further fun modes.** You choose one after M3.3 and propose it as a new step ID.

## You do not own

- The Elo ladder, the ranked queue and tournaments. These belong to Niklas (M2).
- The shared player and match format. Changing it needs both of you to agree (M1.2, `docs/data-contract.md`). Multi-player modes are why that format must allow more than two participants. Raise this during M1.2.
- Players are identified by a simple name for the demo, but invites must refer to the player's internal ID so 42 intra login can be added later (M5.1). "Invite" means inviting inside our own app — confirmed by Eric on 2026-10-20 (contract Q7); 42 intra login stays M5.1.
- Display names are **unique**, compared case-insensitively after trimming (decided by Niklas, 2026-10-20, contract Q1). A rename is allowed.

## Your steps

M3.1 → M3.2, and M3.3 → M3.4 (M3.3 doesn't need M3.1). See PLAN.md. Start only after M1.3 has merged. You also own M1.3, the first recorded match.

## How you work

1. Open a **milestone lead** session for M3 in your own clone. It writes `.ai/work/M3.x/brief.md` for one step at a time.
2. A **coder** session builds the step on branch `m3.x-short-name` and saves `validation.md`.
3. **Niklas's** session (preferably a different AI model) reviews it and writes `review.md`.
4. A **committer** session opens the PR in our fork and merges it after approval.
5. Before closing a session, write a handoff in `.ai/sessions/`.

## Acceptance cases to have ready for your briefs

- An invite to yourself or to a nonexistent player is refused.
- A declined invite has no result and does not count as a played match. (The record itself is
  kept as history — see `docs/data-contract.md` §2 and Q10; the played-match list shows no
  declined match.)
- After a casual match, both players' ratings are exactly unchanged.
- Merry-go-round with 2 players is refused (it needs 3 or more); with 3 players, two eliminations produce one winner.
- A player cannot be eliminated twice in one round.
- On a phone held next to the table, recording an elimination takes one tap.
