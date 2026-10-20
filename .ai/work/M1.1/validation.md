# M1.1 — Validation

Recorded by the M1 milestone lead (Claude Code, Opus 5.5), which ran the deploy at Niklas's
explicit "deploy" instruction on 2026-10-20. No coder change was needed.

**Connection details are left out on purpose.** The assigned URL, the team number, the SSH
port, the host and the key path are known to the lead and are deliberately not written here.
They live in `.workshop.local.md`, which Git ignores. Every URL below is written as
`<assigned URL>`.

## Revision

- Deployed: `main` at `82ebb237da32c2910fc55fb960a301cd7a92b455`, the same as `origin/main` of
  `broccolines/vibecode-workshop-pingpong`.
- Before: the guest checkout `~/src/team` pulled from the workshop starter `ikodo0/vibecode-workshop`
  and served `c3e2c39`. It now pulls from our fork.

## Guest (as `vc-team`, contract `user-app-v1`)

- `npm ci`: up to date, 0 vulnerabilities.
- `npm test`: 21 tests, 21 pass, 0 fail.
- `npm run deploy:preview`: the drop-in sets `APP_REVISION=82ebb237…`, PORT 3000, HOST 0.0.0.0.
- `npm run deploy`: `DEPLOYED 82ebb237da32c2910fc55fb960a301cd7a92b455`. 1 older release
  removed, the active and rollback releases kept.
- `curl http://127.0.0.1:3000/api/health` → `{"ok":true,"revision":"82ebb237da32c2910fc55fb960a301cd7a92b455"}`

## Laptop (Niklas, macOS)

- `npm run smoke -- https://<assigned URL>` → `OK https://<assigned URL> serves revision
  82ebb237da32c2910fc55fb960a301cd7a92b455` (2026-10-20 13:39 UTC).
- This is a **single observation** of a public route that is DNS, TLS and tunnel managed by
  the organiser. It says the route served the intended revision at that moment; it does not
  prove the route is generally available.
- Local `npm test` on the Mac: 20 of 21 pass. `deploy lock rejects a second holder…` fails
  because macOS has no `flock`. The same test passes on the guest, which is the deployment
  target. No action needed for the demo; the guest is authoritative.

## Failure case

No SSH, deploy or smoke failure occurred. Nothing to record beyond the macOS `flock` limit
above, which is an environment limit on a non-target machine rather than a deploy failure. The
deploy helper's own recovery path (restore the previous drop-in, or remove it so the
placeholder serves again) was not exercised, because nothing failed.

## Access boundary

- [x] The deploy ran on the guest as `vc-team`, without sudo.
`~/workshop` was not modified — **not independently checked.** The deploy helper does not
write there by design (`scripts/deploy.mjs` guards that path and prints the line
unconditionally on success), so this is the helper's own statement, not an observation.
Nobody looked at the directory's timestamps. It is on the open list below.
- [x] The guest checkout now pulls our public fork, so **no credential is needed** for the
      fetch — the fork is public. Whether some *other* credential is stored on the guest (an
      old remote, a credential helper, a key) was **not verified**: the guest's credential
      store was not inspected.
- [x] No host, port, key path or token appears in the repository. This step found and removed
      one violation — the assigned URL and the team number were written into this file and into
      `.ai/context.md` by an earlier version of it. The branch tip is clean; see "Known
      disclosure" below for what happened to the history.

The open items for M1.1 are the same list as in `.ai/context.md`:

- [ ] **Eric's phone check** of the assigned URL: the device, the time and what he saw.
- [ ] **Eric's push access** to the fork.
- [ ] **Eric's own personal SSH public key** added to the guest's `~/.ssh/authorized_keys`,
      and a connection with it. The deploy used the shared bootstrap team key from the
      handout, held in Niklas's clone.
- [ ] **GitHub Actions**: the workflow is active for the fork, but no run has been produced
      for any push or pull request yet. This is an organiser-side setting to check.
- [ ] **The Node version used on Niklas's Mac** for the laptop smoke is not recorded.
      Niklas to add it.
- [ ] **`~/workshop` was not independently checked** — nobody looked at the directory's
      timestamps. The deploy helper's own success message says it was not modified.
- [ ] **No browser page check** by the M1 lead. The page is still the unchanged starter page.
- [ ] **Niklas's local clone of `m1.1-live-url` needs to be realigned** after the history
      rewrite. Check `git status` first and save any uncommitted work, then `git fetch origin`,
      `git checkout m1.1-live-url` and `git reset --hard origin/m1.1-live-url`.

## Browser task

Eric opens `<assigned URL>` on a phone and records the device, the time and what he saw.
The M1 lead did not open the page in a browser either; the page is still the unchanged
starter page, so no UI finding is expected. Both are on the open list below.

## Round 4 findings and what changed

Round 4 reviewed the commit after `8ca61f6` and returned REQUEST CHANGES with four minor
findings and no blocker: no security regression, but the evidence was still inconsistent with
itself. What changed:

- **Finding 1** — the review file claimed `git grep -nE "team-0[0-9]" -- .` returns no
  matches. It does not: the pattern matches the starter's own `team-06` fixture in
  `test/deploy.test.mjs`. The review file now says so and points at the placeholder-based
  command in this file, which is the only valid team-specific check.
- **Finding 2** — the review trail said the round-3 verdict was "recorded below" and "pending"
  at the same time, and the newest head was not recorded. The verdicts per round and their
  SHAs are now in one table.
- **Finding 3** — the round-1 M5 row still described the guest-credential claim as "an
  inference from a redacted `git remote -v`", wording that no longer exists. It now matches
  the current evidence.
- **Finding 4** — the open-item lists in `.ai/context.md` and in this file did not match, and
  a claim in the review file said they did. They are now the **same eight items**, word for
  word, and the claim is true.
- The unsafe `git reset --hard` one-liner was still in three other files (`.ai/context.md`,
  the review file and the session handoff). All three now say to check `git status` first and
  save uncommitted work (AGENTS.md rule 3).

Round 5 reviews these fixes on the new head.

## Known disclosure

An earlier commit on this branch wrote the assigned public URL (and therefore the team number)
into `.ai/work/M1.1/validation.md` and `.ai/context.md`. Those strings have been removed.

**Merge consequence — read this before merging.** The leaked string was in the branch's first
commit. Merging that branch as it stood would have written the team URL into `main`'s history
permanently, and `main` is the demo source. To avoid that, the branch history was **rewritten
so that the URL never existed in it**: the branch now carries a single commit whose content is
the sanitised evidence, and the old commit is no longer an ancestor of the branch tip.

What that does and does not achieve:

- The branch tip is clean. Reproduce it with your own team number:
  `git grep -n "team-<your number>" -- .` → **no matches**.
  (There is deliberately no team-specific command in this file: writing our number here would
  put the very string we are removing into the repository. The starter's own documentation and
  tests contain the placeholders `team-NN` and `team-06`, which are not ours — a check for
  `team-` in general will find those and is not a valid test.)
- `main`'s future history stays clean, because the URL is not in the merged commit.
- GitHub keeps unreachable objects reachable by their SHA for a while, so the **old** commit
  may still be fetchable by its SHA. The old SHA is recorded in `.ai/work/M1.1/review.md`
  because honesty about the review trail matters more than hiding it. If the humans want it
  gone from the object store as well, that is an organiser-side request.

**Niklas's local clone must be realigned.** The branch was force-pushed, so his checkout of
`m1.1-live-url` now points at the old history. He should look at his clone first — if it has
uncommitted work, save it before doing anything else — and then run:

```sh
git status                       # look first: do not discard work
git fetch origin
git checkout m1.1-live-url
git reset --hard origin/m1.1-live-url
```

`git reset --hard` throws away uncommitted changes, so the first command matters (AGENTS.md
rule 3: preserve dirty work).

## Known disclosure — summary for the humans

| Item | Status |
|---|---|
| URL / team number in the branch tip | removed |
| URL / team number in the branch history | removed — the history was rewritten before merge |
| URL / team number in `main`'s history | never written, because the merge happened after the rewrite |
| The old commit, fetchable by SHA | may still exist on GitHub until garbage collection; the SHA is in `review.md` on purpose |
| Was anything secret exposed? | no — it is the team's public page address; no key, token or password was ever in the repository |
| Niklas's local clone | needs `git reset --hard origin/m1.1-live-url` (see above) |
