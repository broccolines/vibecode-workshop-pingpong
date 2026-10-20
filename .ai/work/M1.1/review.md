# M1.1 review

Base SHA: `82ebb237da32c2910fc55fb960a301cd7a92b455` (`main`)
Reviewed head SHAs:
- Round 1: `f4ce1f14dd245f3f15652c146b0bc83e538ecefe` (later rewritten away — see "History
  rewrite" below; the SHA is kept on purpose so the trail stays honest)
- Round 2: `f8ea058641d1c2e73aa0bfc77078e5e54638d98d`
- Round 3: `8ca61f61c356b1d17b3b477389cf1d860f6f0e24` — the rewritten single commit on
  `m1.1-live-url` (the branch tip after the history rewrite)

Reviewer session/provider: opencode subagent, `deepseek-v4.1-flash-free`, in three separate
sessions. It did not write the evidence and did not run the deploy.

## Round 1 — REQUEST CHANGES

One blocker and eight further findings. Full list in the table below.

| # | Severity | Finding | Fix |
|---|---|---|---|
| B1 | blocker | The assigned URL, and with it the team number, was committed into `validation.md` and `.ai/context.md`, while the same file claimed connection details were left out. | Removed from the tip **and** from the branch history (see "History rewrite"). |
| M1 | major | The brief said the connection details were "not yet known", contradicting its own records. | The brief now says they are known and deliberately excluded, and names the `<assigned URL>` placeholder. |
| M2 | major | The access-boundary criterion "each human connects with their own key" had no evidence. | Recorded as open, with the fact that the shared bootstrap team key was used. |
| M3 | minor | "`~/workshop` not modified" repeated the helper's unconditional message as an observation. | Attributed to the helper's design, explicitly not independently verified. |
| M4 | minor | The failure-case criterion had no disposition. | A "Failure case" section states that no SSH, deploy or smoke failure occurred and that the macOS `flock` limit needs no action. |
| M5 | minor | "No credential is stored on the guest" was an unverifiable negative. | Round 3 rewrote this further: the evidence now says only that **no credential is needed** for the fetch, because the fork is public, and that the guest's credential store was not inspected. |
| M6 | minor | `.ai/context.md` omitted open items that `validation.md` listed. | The two lists were made to agree — see round 4, finding 4, which found them still out of step and fixed them. |
| N1 | nit | `.ai/work/M1.1/review.md` did not exist. | This file. |
| N2 | nit | The public route was a single observation presented as general hosted verification. | Labelled as a single observation of an organiser-managed route. |

## Round 2 — REQUEST CHANGES

The evidence itself was fixed, but six further problems were found — three of them about the
evidence's internal honesty, three about the review trail:

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | major | `brief.md` still said `node`/`npm` were not installed and that `npm run smoke` could not run locally — while the same commit recorded a laptop smoke run and a 20/21 local test. A reader could not tell which machine ran what. | The brief now states that Node was installed before the laptop smoke, that the exact version is **not recorded** (a gap, not a claim), and that the smoke and the 20/21 run happened on Niklas's Mac while the guest is the deployment target. |
| 2 | major | The history leak was disclosed, but its **merge consequence** was not stated: merging the branch as it stood would have written the team URL into `main`'s history, permanently, and `main` is the demo source. | The evidence now states that the rewrite had to happen before the merge, what the rewrite achieves, and what it cannot achieve (GitHub may keep the old commit reachable by SHA for a while). Niklas's clone is told how to realign. |
| 3 | minor | The stated leak check (`git grep team-` finds nothing) is false — the starter's own docs and tests contain `team-NN` and `team-06`. | The evidence now uses a placeholder command (`git grep -n "team-<your number>" -- .`) and explains why a pattern such as `team-0[0-9]` is **not** a valid check: it matches the starter's own `team-06` fixture. See round 4, finding 1. |
| 4 | minor | The session handoff was stale: it still said "not committed", "no PR", "no reviewer dispatched". | The handoff now names the branch, the pushed state, the reviewed SHAs per round and the open items. |
| 5 | minor | The review record overstated the M6 fix ("identical to `validation.md`" was not true). | The open-item lists were made identical, and the claim is now true. |
| 6 | nit | The round-2 placeholder pointed nowhere. | This section now holds the actual round-2 record. |

## History rewrite

Between round 2 and round 3 the branch history was rewritten: the two commits were replaced
by a single commit whose content is the sanitised evidence. Reason: the team URL existed in the
first commit, and merging it would have written that URL into `main`'s history for good.

- The branch tip was clean before the rewrite too; the rewrite removed the string from the
  *history*, not only from the tip.
- The branch was force-pushed, so **Niklas's local clone must be realigned**. Check
  `git status` first and save any uncommitted work before resetting (AGENTS.md rule 3):
  `git fetch origin`, `git checkout m1.1-live-url`, `git reset --hard origin/m1.1-live-url`.
- The old SHA `f4ce1f1` stays recorded in this file on purpose. Hiding it would be a worse
  lie than keeping it. It may remain fetchable from GitHub by SHA until garbage collection.

## What was checked, in every round

- Scope: the diff touches only `.ai/` documentation. No executable file changed, ever.
- Each acceptance criterion of the brief, mapped to the evidence, with open items marked open.
- Every tooling claim against `scripts/deploy.mjs` and `scripts/smoke.mjs`: tests run first and
  refusing a failed release, release pruning, the atomic drop-in swap, the health check against
  the intended revision, the rollback path, `~/workshop` left alone, and the `flock` dependency
  that macOS lacks.
- The health/smoke contract against `server.mjs` and AGENTS.md.
- Greps for the team URL, the team number, host paths, key paths, tokens and attribution
  trailers.

## Round 3 — REQUEST CHANGES, and what changed

Round 3 reviewed the rewritten head `8ca61f6` and confirmed the security substance: the
history really was rewritten, the tip is clean, and the disclosure is honest. It sent the step
back for **evidence integrity** only — six minor findings, no blocker:

| # | Finding | Fix |
|---|---|---|
| 1 | `~/workshop` was ticked `[x]` while the text said it was not independently verified. | Un-ticked and reworded: it is the helper's own statement, not an observation. |
| 2 | "pulls our public fork, so no credential is stored on the guest" did not follow. | Weakened to "no credential is **needed** for the fetch", with the guest's credential store explicitly not inspected. |
| 3 | The realignment instruction used `git reset --hard` without a `git status` check first, which conflicts with AGENTS.md rule 3 (preserve dirty work). | The instruction now starts with `git status` and says to save uncommitted work first. |
| 4 | The brief named a reviewer model that was not the one that ran. | The brief now names no model; the reviewer file names the real one. |
| 5 | The round-2 record said "three further problems" and listed six. | Corrected. |
| 6 | The round-3 head was recorded as "the rewritten single commit" instead of a SHA. | The exact SHA `8ca61f6` is now recorded. |

Round 4 reviewed these six fixes on the new head `1ea2ccb` and returned REQUEST CHANGES
with four minor findings, all about the evidence still being inconsistent with itself. They
are fixed in the commit after `1ea2ccb`; the fixes are listed in `.ai/work/M1.1/validation.md`.

## Not verified, in every round

No guest, no SSH, no DNS, no TLS, no public URL probe, no phone, no browser, no GitHub Actions
run, no PR state. The reviewer did not run the deploy and did not connect to anything. The
guest's release directories, the kept rollback release, the guest's git remote and
`~/workshop`'s modification times remain unverified by anyone but the deploy session.

## Verdict per round

| Round | Head | Verdict |
|---|---|---|
| 1 | `f4ce1f1` | REQUEST CHANGES |
| 2 | `f8ea058` | REQUEST CHANGES |
| 3 | `8ca61f6` | REQUEST CHANGES — 6 minor findings (recorded above) |
| 4 | `1ea2ccb` | REQUEST CHANGES — 4 minor findings (recorded in `.ai/work/M1.1/validation.md`) |

Round 3: **REQUEST CHANGES** — six minor findings, no blocker; the security substance (the
history rewrite, the clean tip, the honest disclosure) was confirmed.
Round 4: **REQUEST CHANGES** — four minor findings about evidence consistency; the new head
and its SHA are recorded in `.ai/work/M1.1/validation.md`.
