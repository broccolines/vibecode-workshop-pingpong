# M1.2 — Shared format (data contract v1)

## Outcome

Both humans can read one document and build against the same player, match, invite and round
records without inventing their own. After this step, the ladder track and the fun track can
work in parallel on separate clones.

## Audit

- `server.mjs` is the untouched starter: static assets, `/api/health`, no data layer, no
  mutation routes.
- `PLAN.md` M1.2 lists the questions this document must answer.
- `.ai/team/niklas.md` and `.ai/team/eric.md` both list the shared format as jointly owned.
- Base SHA for this step: `82ebb23` (`main`).
- Assumption checked: `docs/data-contract.md` does not exist in any branch yet
  (`git log --all -- docs/data-contract.md` is empty).

## Acceptance

- [ ] `docs/data-contract.md` exists and answers every question in PLAN.md M1.2.
- [ ] It names a stable player id separate from the display name, and says explicitly whether
      two players may share a name.
- [ ] It defines a match: mode, participants, state, score/placings, timestamps, and who may
      report and who must confirm.
- [ ] It states which track owns which field, and that ratings come only from confirmed
      `ranked` matches.
- [ ] It names where data is stored on the server so it survives a redeploy.
- [ ] It fixes the HTTP surface each track may use, so the two tracks do not fight over one
      router file.
- [ ] It fixes the file-level ownership split, so the two tracks rarely touch the same file.
- [ ] It lists the rules that must never break (fun modes never change ratings; matches refer
      to ids, never names; data outside the release directory; `/api/health` unchanged).
- [ ] Niklas has read it. Until he has, this is a proposal, not an agreement.

## Boundaries and dependencies

- Depends on: M1.1 (the live URL exists, so both humans can read the same document at the
  same time).
- Changes nothing in the code. This step is a document only.
- Does not decide the UI, the framework or the Elo formula beyond what PLAN.md already
  decided (1000 start, K=32).

## Handoff

- Human owner: both (Niklas + Eric).
- Written by: the M1 milestone lead session.
- Next step after this: M1.3 brief, then the coder session.
