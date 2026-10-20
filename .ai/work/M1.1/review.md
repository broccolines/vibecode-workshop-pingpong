# M1.1 review

Base SHA: `82ebb237da32c2910fc55fb960a301cd7a92b455` (`main`)
Reviewed head SHAs:
- Round 1: `f4ce1f14dd245f3f15652c146b0bc83e538ecefe` (later rewritten away — see "History
  rewrite" below; the SHA is kept on purpose so the trail stays honest)
- Round 2: `f8ea058641d1c2e73aa0bfc77078e5e54638d98d`
- Round 3: the rewritten single commit on `m1.1-live-url` — see the table at the bottom

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
| M5 | minor | "No credential is stored on the guest" was an unverifiable negative. | Now labelled as an inference from a redacted `git remote -v`. |
| M6 | minor | `.ai/context.md` omitted open items that `validation.md` listed. | The open-item list in `.ai/context.md` now matches `validation.md` item for item. |
| N1 | nit | `.ai/work/M1.1/review.md` did not exist. | This file. |
| N2 | nit | The public route was a single observation presented as general hosted verification. | Labelled as a single observation of an organiser-managed route. |

## Round 2 — REQUEST CHANGES

The evidence itself was fixed, but three further problems were found:

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | major | `brief.md` still said `node`/`npm` were not installed and that `npm run smoke` could not run locally — while the same commit recorded a laptop smoke run and a 20/21 local test. A reader could not tell which machine ran what. | The brief now states that Node was installed before the laptop smoke, that the exact version is **not recorded** (a gap, not a claim), and that the smoke and the 20/21 run happened on Niklas's Mac while the guest is the deployment target. |
| 2 | major | The history leak was disclosed, but its **merge consequence** was not stated: merging the branch as it stood would have written the team URL into `main`'s history, permanently, and `main` is the demo source. | The evidence now states that the rewrite had to happen before the merge, what the rewrite achieves, and what it cannot achieve (GitHub may keep the old commit reachable by SHA for a while). Niklas's clone is told how to realign. |
| 3 | minor | The stated leak check (`git grep team-` finds nothing) is false — the starter's own docs and tests contain `team-NN` and `team-06`. | The reproducible command is now `git grep -nE "team-0[0-9]" -- .` → no matches, and the evidence explains why the broader command is not a valid test. |
| 4 | minor | The session handoff was stale: it still said "not committed", "no PR", "no reviewer dispatched". | The handoff now names the branch, the pushed state, the reviewed SHAs per round and the open items. |
| 5 | minor | The review record overstated the M6 fix ("identical to `validation.md`" was not true). | The open-item lists were made identical, and the claim is now true. |
| 6 | nit | The round-2 placeholder pointed nowhere. | This section now holds the actual round-2 record. |

## History rewrite

Between round 2 and round 3 the branch history was rewritten: the two commits were replaced
by a single commit whose content is the sanitised evidence. Reason: the team URL existed in the
first commit, and merging it would have written that URL into `main`'s history for good.

- The branch tip was clean before the rewrite too; the rewrite removed the string from the
  *history*, not only from the tip.
- The branch was force-pushed, so **Niklas's local clone must be realigned**:
  `git fetch origin && git checkout m1.1-live-url && git reset --hard origin/m1.1-live-url`.
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
| 3 | rewritten single commit | recorded below |

Round 3: pending.
