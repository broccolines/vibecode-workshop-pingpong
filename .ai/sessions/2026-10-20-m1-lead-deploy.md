# Session — 2026-10-20 M1 milestone lead: first deploy

## Decisions

- The guest checkout `~/src/team` now tracks our public fork
  `broccolines/vibecode-workshop-pingpong` instead of the workshop starter.
- Niklas gave the release instruction ("deploy"). `82ebb23` is deployed.
- The team key and known_hosts files sit untracked in Niklas's clone. They are ignored only
  through `.git/info/exclude`, which is local to this clone.
- The branch history of `m1.1-live-url` was rewritten before merge, so the assigned URL that
  an earlier commit had written into the evidence never enters `main`'s history. See
  "Known disclosure" in `.ai/work/M1.1/validation.md`. Niklas's local clone must be realigned
  with `git fetch origin && git reset --hard origin/m1.1-live-url`.

## Handoff

State: M1.1 brief, validation and review are written in `.ai/work/M1.1/` and committed on the
pushed branch `m1.1-live-url`; the evidence PR is open against `main` in our fork. Public
health reports `82ebb23`.

Reviewed SHAs so far:

| Round | Base | Head | Verdict |
|---|---|---|---|
| 1 | `82ebb23` | `f4ce1f1` | REQUEST CHANGES — 1 blocker (the assigned URL was committed), plus major/minor findings |
| 2 | `82ebb23` | `f8ea058` | REQUEST CHANGES — the evidence was fixed, but the leaked URL was still in the branch history, which would have put it into `main`'s history on merge |
| 3 | `82ebb23` | rewritten single commit | see `.ai/work/M1.1/review.md` |

Next step: the round-3 review of the rewritten head, then Eric's phone check, then the
committer merges the evidence PR. After that, brief M1.2.

Half-done work: Eric's phone check, Eric's push access, Eric's personal SSH key on the guest,
GitHub Actions runs, and the Node version on Niklas's Mac are all still open — see
`.ai/work/M1.1/validation.md`.

Branch / reviewed SHA / PR: `m1.1-live-url`, pushed to the fork; PR open in
`broccolines/vibecode-workshop-pingpong`.

Checks and limitations: guest `npm test` 21/21. Niklas's Mac `npm test` 20/21 (no `flock` on
macOS). One public smoke observation at 2026-10-20 13:39 UTC. No browser check, no phone
check, no independent verification of the guest's release directories or `~/workshop`.
