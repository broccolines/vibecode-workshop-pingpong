# M1.3 review

Base SHA: 33f0c75204f4474317f657a473de2d585f3a4c03
Head SHA: f0eb4b3d1746022eaf024dfbc6c883c5e92f6f4c (confirmed with `git rev-parse HEAD` on `m1.3-first-match`; code commit 2a7f6d9, validation commit f0eb4b3)
Reviewer session/provider: Claude Code subagent, Claude Opus (same model family as the coder's provider; a fresh session that did not write the change). No browser tool was available.
Date: 2026-10-20

## What I checked

I read the full diff `33f0c75..f0eb4b3`: lib/ladder.mjs, lib/store.mjs, server.mjs, public/*, test/app.test.mjs, test/ladder.test.mjs and the evidence files. I checked it against the brief, against docs/data-contract.md sections 1, 2, 3, 6 and 7, and against validation.md. `git diff --stat` shows no changes to scripts/, package.json, package-lock.json or docs/.

| Acceptance | Evidence (run by me unless marked "by reading") | Result |
|---|---|---|
| Normal case (API) | `PORT=3002 DATA_DIR=<scratch>` with curl: health OK, empty `[]`/`[]`. Created Anna, then `"  Ben  "` (stored as "Ben"). Recorded Anna 2-1 Ben and got 201 with a full contract record. `kill -9`, restarted on the same DATA_DIR: all players and both matches came back. | Pass (HTTP) |
| Normal case (browser: reload, second device) | Not verified (no browser). By reading: the list renders "Anna 2–1 Ben" plus a `<time>`. A second device starts with no saved "me" (see F1). | **Not verified** |
| Empty state | By reading, app.js:37-38: the hint for 0 players and for 1 player, the record section hidden until there is an opponent, and "No matches yet." | Pass by reading, not seen |
| Failure cases | Over curl, each returned 4xx with a clear message and the store file stayed byte-identical (apart from the 1e300 case, see F2): nonexistent opponent (404), same player twice, equal scores, missing score, negative, fractional, nonexistent acting player (403), ranked from a client (403), `mode: null`, `__proto__` participant, array/null body. Names: `" anna "` 409; `""`, `"   "`, 31 chars and NUL all 400. The test suite also covers a non-participant acting player, string/null scores and 3 or 1 participants. | Pass (see F3 on test strength) |
| Data boundary | `curl --path-as-is`: `/store.json`, `/../store.json`, `/%2e%2e/server.mjs`, `/public/app.js`, `/lib/store.mjs`, `/api/../package.json`, `/api/players/../../server.mjs`, `/package-lock.json`, `/.git/HEAD` and `/api/players/` all return 404; PUT gives 405. The store is created at mode 600 under DATA_DIR only, and a DATA_DIR inside the repo is refused at startup (edge case F4). A corrupt store prevents startup with a clear error. Concurrency (by reading and by test): a single promise-chain queue; validation runs inside the queued step against the latest state; memory changes only after a durable write. The test with 20 different names and 10 identical names passes. Crash safety (by reading): temp file, fsync, rename, directory fsync, stale temp files removed at startup. The test for "failed write keeps previous state" passes. | Pass, single process only (documented) |
| Contract shape | Stored player: `schemaVersion` 1, `p_` + 12 hex characters, `externalLogin: null`, ISO `createdAt`. Match: every section 2 field, `mode: casual`, `state: confirmed`, `decidedBy: null` (as in example 8.3), `details: {}`, all four timestamps ISO and equal, participants hold IDs. Unknown fields: `update` clones whole records and spreads the top-level document, and the restart test proves `futureField` and `details.mode_extra` survive. | Pass |
| Deploy contract | `/api/health` code unchanged and returns `{"ok":true,"revision":"development"}`. POST to /api/health gives 405. The PORT handling is unchanged and `PORT=abc` exits with an error. No dependencies were added. `npm test` (Node 26.12.0, macOS): 30 tests, 29 pass; the 1 failure is the known `flock` deploy-lock test. | Pass |
| XSS | By reading, app.js: every name goes through `textContent`/`option.textContent`; there is no `innerHTML`. I stored the name `<img src=x onerror=alert(1)>` (allowed by the contract); it only reaches the DOM as text. | Pass by reading |
| Browser task (desktop and 390 px) | **NOT VERIFIED.** Neither the coder nor this reviewer had a browser tool. Tap targets, horizontal scroll and the reload/second-device journey have not been seen. | Open |

I could not check: any browser rendering; behaviour on Linux or on the guest (Node 24, `~/.local/share/...` writability, contract Q9); and true power-loss crash safety (judged by reading only).

## Findings

**F1 — Medium — public/app.js:30-32, 63 (the "who are you" flow).** The acting player is chosen silently, and "create yourself" does not make you "me" once the page already has players.
- Failing case 1: on a second device (empty localStorage), Anna and Ben exist. Cem opens the page. The `me` select silently picks the first option (Anna), and render (line 32) saves that to localStorage as "me".
- Failing case 2: Cem then uses "Or create a player" to create himself. Line 63 keeps `myId()` (Anna), so "me" stays Anna.
- Consequence: if Cem now records "my 3 – their 1", the match is stored with Anna as `createdBy`/`reportedBy` and with Anna's score. That is a wrong record caused by the UI itself, not by deliberate cheating on the honour system, and on another device it breaks the brief's "pick or create yourself" journey.
- Required outcome: with no saved identity, the page must not assume one. Recording needs an explicit choice, for example a "Choose…" placeholder or the record section disabled until a choice is made. It must also be possible to create yourself and become "me" when players already exist, without making it easy to turn the opponent you just created into "me". Verify this in a browser.

**F2 — Low — lib/ladder.mjs:58.** Scores have no upper bound and are not checked to be safe integers. `{"scores": {A: 1e300, B: 1}}` is accepted and stored (201), and the list would show "1e+300–1". Values above 2^53 lose precision when stored as JSON. The contract only says "non-negative whole number", so this is not a contract breach, but a ranked best-of score will need a sane bound. Required: use `Number.isSafeInteger` and a reasonable cap (for example ≤ 99), or record why there is none.

**F3 — Low — test/ladder.test.mjs:25-31, 129-130.** `rejected()` takes the "before" snapshot after the rejected request has already run. The per-case "nothing changed" assertion therefore compares two post-request snapshots and can never fail. Only the final `assert.deepEqual(matches, [])` (line 132) really proves no match was stored, and nothing checks the players list per case. Separately, the traversal paths in the data-boundary test go through `fetch`, which normalises `..` before sending, so the server never sees a raw `..`. I checked the raw paths with `curl --path-as-is` and they return 404. Required: take the snapshot before the request; optionally send raw traversal paths with `http.request`.

**F4 — Low — server.mjs:90.** The "DATA_DIR must be outside the app directory" guard uses `rel.startsWith('..')`. A directory inside the repo whose name starts with `..` (for example `<repo>/..x`) gives `rel = "..x"` and is accepted. A symlink into the repo is not caught either. The data still cannot be served because the server only serves whitelisted files, so the impact is small. Required: test for `rel === '..' || rel.startsWith('..' + sep)`.

**F5 — Info (for the contract owners, no change required in M1.3).** Lookalike names get past the duplicate rule. `"Anna​"` (with a zero-width space) and `"Ａｎｎａ"` (fullwidth letters) are both accepted next to `Anna`. This is compliant: contract section 1 only bans control characters (Cc) and compares case-insensitively. It does undercut the reason the contract gives for unique names. Niklas and Eric could consider NFKC normalisation and rejecting format characters (Cf) in a later contract change.

**F6 — Info.** The single-process limitation and the full rewrite on every change are documented honestly in validation.md. During a deploy, an overlap of old and new processes could lose writes. This needs to be confirmed against how vc-app restarts before M2 relies on concurrent ranked confirmations.

## Verdict

**REQUEST CHANGES** at f0eb4b3d1746022eaf024dfbc6c883c5e92f6f4c.

The storage, validation, contract shape, data boundary and deploy contract are solid, and I verified them over HTTP including persistence after a restart. Two things block approval:
1. F1: the UI can attribute a recorded match to the wrong acting player in the brief's own journey ("pick or create yourself" on a second device).
2. The browser acceptance task (desktop and phone width, reload, second device) has not been verified by anyone.

Required before re-review:
- Fix F1.
- Fix F3, the vacuous snapshot in the tests.
- Have someone with a browser run and record the desktop and 390 px journey.
- F2 and F4 are low and should be fixed or explicitly waived.

Any new SHA needs re-review.

## Round 2

Base SHA: 33f0c75204f4474317f657a473de2d585f3a4c03
Round-1 head: f0eb4b3d1746022eaf024dfbc6c883c5e92f6f4c
Head SHA: c9f34f6572c7edbb92e03741da2343cda5382e42 (confirmed with `git rev-parse HEAD` on `m1.3-first-match`; fix commit 3595d09, validation commit c9f34f6)
Reviewer session/provider: Claude Code subagent, Claude Opus (fresh session; did not write the change). No browser tool was available.
Date: 2026-10-20

### What I checked

- I read the full fix diff `f0eb4b3..c9f34f6` and re-read the current lib/ladder.mjs, lib/store.mjs, server.mjs, public/app.js and public/index.html. `git diff --stat 33f0c75..c9f34f6` shows no changes to scripts/, package.json, package-lock.json, docs/ or test/deploy.test.mjs. There is no `innerHTML` in public/, and no secrets or private paths in the diff.
- `npm test` (Node 26.12.0, macOS): 31 tests, 30 pass. The 1 failure is the known `deploy lock ... flock is missing` test.
- HTTP, using `PORT=3002 DATA_DIR=<scratchpad>/data-r2`:
  - Health returns `{"ok":true,"revision":"development"}`.
  - I created Anna and Ben, then sent these failures: scores 100, 1e300 and raw `1e999`; empty acting player; missing acting player; same player twice; equal scores; nonexistent acting player; client `mode: ranked`; names `" anna "`, `""`, `"   "` and 31 chars. Each one got a 4xx with a clear message. **store.json was byte-identical before and after (shasum).**
  - I recorded Anna 2–1 Ben (201, full contract record: casual/confirmed, IDs, ISO timestamps, `decidedBy: null`, `details: {}`). Ben 99–0 Anna was also accepted, so the cap is inclusive.
  - With `curl --path-as-is`, all of these return 404: `/store.json`, `/../store.json`, `/%2e%2e/server.mjs`, `/lib/store.mjs`, `/package.json`, `/.git/HEAD`, `/..x` and `/api/../server.mjs`.
  - I ran `kill -9` and restarted on the same DATA_DIR. Both players and both matches came back. The directory holds only `store.json`, mode 600.
  - Startup with `DATA_DIR=<repo>/..x-r2test` is refused with "must be outside the app directory".
  - Clean-up done: the temp dir and test dir were removed, and port 3002 is free.

### Round-1 findings

- **F1: resolved (by reading; not seen in a browser).** public/app.js:24-42 and 62-81.
  - *Second device* (empty localStorage, Anna and Ben exist):
    - `wanted` is null, so `me` shows the placeholder "Choose yourself…" with value `''` and the saved key is removed.
    - The record section is hidden (line 39) and the hint asks you to choose or create yourself.
    - `suggestIsMe` ticks "This is me". When Cem creates himself, `makeMe` is true, so after `load()` the code sets `me` to Cem's id, re-renders, saves it and unticks the box.
    - A later opponent creation leaves `me` = Cem.
    - Picking an existing name sets `me` only through the explicit change event. Choosing the placeholder again clears it.
    - The submit handler also refuses an empty me or opponent (lines 80-81).
    - Nothing assumes an identity any more.
  - *First device* (no players):
    - Hint: "No players yet…". The box is ticked, so Anna becomes `me`.
    - The box is then unticked, so creating Ben does not change `me`. The opponent becomes Ben (the only candidate, no placeholder) and the record section appears.
    - A stale saved id for a player who no longer exists is dropped (line 28).
- **F2: resolved.** lib/ladder.mjs:42,61. The check is now `Number.isSafeInteger`, with 0..99 (`MAX_SCORE`) and the reason documented. Tests cover 1e300, 2^53, 100, `1e999` (Infinity) and 99 accepted. I confirmed this over HTTP.
- **F3: resolved.**
  - test/ladder.test.mjs:27-39: `rejected()` now takes the snapshot before calling `send()` and compares afterwards with a label.
  - Lines 226-238: raw `node:http` paths are added, so `..` is not normalised by the client.
  - The coder says that disabling the equal-scores rule made the test fail. I did not repeat that mutation, but by reading the assertion can now fail.
- **F4: resolved.** server.mjs:83-86 and 94. `isInsideDir` handles `rel === '..'` or `'..' + sep`, and the unit test covers the `..x` sibling. I confirmed the refusal at startup. Symlinks are still not resolved. That stays acceptable because only whitelisted assets are served.
- F5 and F6: info only, unchanged. They are recorded as known limitations in validation.md.

### Regression check (base..head)

- Contract shape: unchanged and conformant.
- Failure cases store nothing: confirmed by tests and shasum.
- Acting player:
  - Must exist (403) and be a participant (test).
  - Client-sent `ranked` is refused (403).
  - The honour system is shown in the footer.
- Store: the single queued promise chain and the temp+fsync+rename+dir-fsync write are unchanged since round 1.
- Data boundary: only 3 whitelisted assets are served. Nothing under DATA_DIR or the repo is served.
- Deploy contract: `/api/health` and PORT handling are unchanged, and no dependencies were added.
- XSS-safe rendering: names and options are set only via `textContent`. The new placeholder options use `textContent`.
- Scope: the diff touches only the M1.3 files.

### New findings

- **F7: Info. public/app.js:62, index.html:24.** With no identity chosen, "This is me" is pre-ticked. Say an existing player (for example Anna on a new phone) creates the opponent first without picking herself. The opponent then becomes `me`. The checkbox is visible and labelled, and the hint tells her to choose herself first, so this is a deliberate, visible default rather than a silent assumption. It does not block. Niklas may want to watch for it during the browser check.

### Not verified

- **Browser journey NOT verified by me.** I did not check desktop or 390 px width, tap targets, horizontal scroll, reload or the second-device flow in a real browser. Following the human decision of 2026-10-20, Niklas will do this on the live site after deploy and record it. It stays an **open follow-up** for the brief's "Browser task" acceptance item.
- Linux/guest behaviour (Node 24, the flock test, default data path writability) was not checked.

### Verdict

**APPROVE** at c9f34f6572c7edbb92e03741da2343cda5382e42, with one open follow-up: the desktop and phone browser journey must be performed and recorded by Niklas after deploy. F1–F4 are resolved, and I found no regressions. This approval covers only this SHA.
