# Data contract v1

Owner: M1, jointly (Niklas + Eric). Written 2026-10-20, revised after the M1.2 review.
**Niklas has not read this yet — it is a proposal, not an agreement.**

The demo has **no login and no password**. Players identify by a name, but everything the
system stores refers to a stable internal id. That is what lets 42 intra login be attached
later (M5.1) without rewriting matches or ratings.

**Change rule.** After M1.3 merges, changing this document is a **new step ID agreed by both
humans** (AGENTS.md rule 2: append new IDs, never renumber; and AGENTS.md rule 7: the shared
format is jointly owned). Never a quiet edit inside a track branch.

---

## 1. Player

| Field | Type | Rule |
|---|---|---|
| `id` | string | `p_` + 8 lowercase hex characters. Stable for life, never reused, never changes. Everything else refers to this. The store regenerates an id that already exists (see §6). |
| `name` | string | 1–40 characters after trimming. **Not unique** — two players may share a name; the demo must still work when they do. A name is fixed once the player is created (no rename endpoint in this version). |
| `intraId` | string or null | Always `null` in the demo. The slot for the future 42 intra login (M5.1). |
| `rating` | integer | Default `1000`. A **cache** of a derived value, see §5. The ladder track owns it; the fun track never writes it. Until M2.1 lands, every rating stays 1000. |
| `createdAt` | ISO 8601 UTC string | When the player was created. |

Rules:
- Matches, invites, rounds, queues and ratings refer to `id`, **never to `name`**.
- A display name is never a key. Two players with the same name are two different players.

## 2. Match

| Field | Type | Rule |
|---|---|---|
| `id` | string | `m_` + 8 lowercase hex characters. |
| `mode` | enum | `ranked`, `casual`, `merry-go-round`. New fun modes are added to this list explicitly, with their own rules. |
| `playerIds` | string[] | Player ids. **Exactly 2** for `ranked` and `casual`; **3 or more** only for `merry-go-round`, and a merry-go-round match is created by the round route (§4), never by the create route. No duplicates; all ids must exist. |
| `state` | enum | `proposed`, `reported`, `confirmed`, `disputed`. |
| `winnerId` | string or null | Required when a score is reported. Must be one of `playerIds`. Must be the **unique** player with the most games won. A tied score is refused. |
| `score` | object or null | `playerId → games won`. Its keys are **exactly** `playerIds`. `null` only while the match is `proposed`. |
| `reportedBy` | string or null | The acting player who reported the result. `null` until a report happens. |
| `confirmedAt` | ISO 8601 UTC string or null | Set when the match becomes `confirmed`. This is the replay order for rating derivation (§5). |
| `createdAt`, `updatedAt` | ISO 8601 UTC string | All timestamps are UTC. |

### State machine, per mode

```
ranked (exactly two players)
    proposed ──(winner reports)──▶ reported ──(loser confirms)──▶ confirmed
                                            └─(loser disputes)──▶ disputed

casual (exactly two players)
    proposed ──(winner reports)──▶ confirmed

merry-go-round (three or more players)
    created by the round route in state `confirmed`; it is a summary record only
    (§4). Its ordering lives in the round, never in the match.
```

- `confirmed` and `disputed` are final.
- A `disputed` match never changes ratings and stays visible to both participants.
- **Only the winner may report.** The loser confirms or disputes a reported **ranked**
  result (PLAN.md M2.3 and `.ai/team/niklas.md`). For **casual** the report is stored as
  `confirmed` immediately: there is no dispute step, because it would change nothing —
  casual never feeds ratings.
- A match reaches `proposed` only through an accepted invite (§3).

### Who may report and who must confirm

- The **acting player** is the player the browser currently acts as. The demo has no
  authentication: the browser sends a player id and the server trusts it. This is **not a
  security boundary**; M5.1 replaces it with a real login.
- Only a participant of the match may report it, and only the winner may report (§2).
- Only the participant who did **not** report may confirm or dispute it.
- The acting player is stored in the browser under `localStorage` key `pp.playerId` and is
  shown in the UI at all times, so a phone next to the table always knows whose turn it is.

## 3. Invite

Used by the fun track for casual matches (M3.1).

| Field | Type | Rule |
|---|---|---|
| `id` | string | `i_` + 8 lowercase hex characters. |
| `fromPlayerId` | string | The inviter. |
| `toPlayerId` | string | The invitee. Must exist and must differ from `fromPlayerId`. |
| `state` | enum | `pending`, `accepted`, `declined`. |
| `createdAt`, `updatedAt` | ISO 8601 UTC string | |

Rules:
- An invite to yourself, to a player that does not exist, or a second pending invite from the
  same sender to the same player, is refused and stores nothing.
- Only the **invitee** may accept or decline. The inviter can do neither.
- A declined invite stores no match.
- Accepting an invite creates a `casual` match in state `proposed` with both players as
  participants, `score: null`, `reportedBy: null`. The winner reports the score later (§7).

## 4. Round (merry-go-round)

Used by the fun track (M3.3).

| Field | Type | Rule |
|---|---|---|
| `id` | string | `r_` + 8 lowercase hex characters. |
| `playerIds` | string[] | At least 3 player ids, no duplicates, all must exist. Two players is refused. |
| `state` | enum | `running`, `finished`. |
| `eliminations` | string[] | Player ids in elimination order. A player may appear at most once. |
| `winnerId` | string or null | The last player standing. Set when the round finishes. |
| `createdAt`, `updatedAt` | ISO 8601 UTC string | |

Rules:
- A round finishes when exactly one player is left; that player is the winner.
- Eliminating a player who is not in the round, an already eliminated player, or the last
  remaining player is refused and stores nothing.
- When the round finishes, the round route creates **one** summary `merry-go-round` match in
  state `confirmed` with `winnerId` = the round winner. The round route is the **only** writer
  of that match; it can never be created or changed through the match routes (§7).
- A round never touches ratings.

## 5. Ratings (owned by the ladder track)

- Start **1000**, **K-factor 32** (decided 2026-10-20).
- Derived from **confirmed `ranked` matches only**. A disputed match never contributes.
- `player.rating` is a **cache**, not the truth. The truth is the replay of the confirmed
  ranked match history. The replay order is `confirmedAt` ascending, ties broken by match id.
- The shared core calls `recomputeRatings(store)` from `src/domain/ratings.mjs` after every
  match write and once at boot. In M1.3 that file is a no-op shipped by the ladder track's
  file slot, so every rating stays 1000. **M2.1 replaces that file** — that is the seam, and
  it means M2.1 never has to edit frozen shared core.
- The fun track **never** writes `player.rating`. Casual and merry-go-round results leave
  every rating exactly unchanged. This is a review checkpoint on every fun-track step.

## 6. Where the data lives

- Directory: `process.env.DATA_DIR`, default `~/.local/share/vibecode-workshop/data/`.
- One file: `store.json` in that directory.
- **Never** inside a release directory, never inside the repository, never in git.
- Loaded once at boot into memory, written back **atomically** (write a temporary file in the
  same directory, then rename over `store.json`) after every change, so a crash mid-write
  cannot corrupt the store.
- The store module is the **only** writer. Route handlers call it; nothing else touches the
  file.
- Ids are generated with a random 32-bit suffix; if an id already exists in the store, the
  store generates another one. Uniqueness is guaranteed by that check, not by the random
  draw alone.

## 7. HTTP surface

JSON over HTTP on the same server. **One envelope for every endpoint:**

```json
{ "ok": true,  ...payload }
{ "ok": false, "error": "<human readable sentence>" }
```

- Success responses always contain `ok: true`. The payload keys are listed below.
- Errors always contain `ok: false` and a human-readable `error`, with status `400` for a bad
  request, `404` for an unknown id and `409` for a state that does not allow the change.
- **Every refused or invalid transition stores nothing** and returns the error shape.

| Method | Path | Request body | Success payload | Notes |
|---|---|---|---|---|
| GET | `/api/health` | — | `{ok, revision}` | `{"ok": true, "revision": "..."}` — unchanged, deployment contract |
| GET | `/api/players` | — | `{ok, players: [...]}` | |
| POST | `/api/players` | `{name}` | `{ok, player}` | name 1–40 chars after trimming |
| GET | `/api/matches` | — | `{ok, matches: [...]}` | newest first |
| POST | `/api/matches` | `{mode, playerIds, winnerId, score, actor}` | `{ok, match}` | `mode` is `ranked` or `casual` only. Creates **and** reports in one call: a `ranked` match lands in `reported`, a `casual` match in `confirmed`. `merry-go-round` is refused here. |
| GET | `/api/matches/:id` | — | `{ok, match}` | |
| POST | `/api/matches/:id/report` | `{winnerId, score, actor}` | `{ok, match}` | The **report-on-existing-match** transition, used for a match that is `proposed` (an accepted invite). Same winner/score rules as §2. A `ranked` match reported this way lands in `reported`; a `casual` one in `confirmed`. |
| POST | `/api/matches/:id/confirm` | `{actor}` | `{ok, match}` | Only the participant who did not report. Only from `reported`. |
| POST | `/api/matches/:id/dispute` | `{actor}` | `{ok, match}` | Only the participant who did not report. Only from `reported`. |
| GET | `/api/invites` | — | `{ok, invites: [...]}` | |
| POST | `/api/invites` | `{toPlayerId, actor}` | `{ok, invite}` | |
| POST | `/api/invites/:id/accept` | `{actor}` | `{ok, invite, match}` | The invitee only, only while `pending`. Creates the casual match in `proposed`. |
| POST | `/api/invites/:id/decline` | `{actor}` | `{ok, invite}` | The invitee only, only while `pending`. Creates no match. |
| GET | `/api/rounds` | — | `{ok, rounds: [...]}` | |
| POST | `/api/rounds` | `{playerIds, actor}` | `{ok, round}` | 3 or more players. |
| POST | `/api/rounds/:id/eliminate` | `{playerId, actor}` | `{ok, round}` | Creates the summary match when the round finishes. |

**Track prefixes** so the two tracks rarely touch the same file:
ladder track owns `/api/queue`, `/api/tournaments`; fun track owns `/api/invites`,
`/api/rounds`. The shared part above belongs to M1 and is frozen after M1.3.

## 8. File-level ownership (so the two tracks rarely collide)

```
server.mjs              M1 shared core   HTTP server, auto-loads src/routes/*.mjs
src/store.mjs           M1 shared core   persistence
src/domain.mjs          M1 shared core   the call surface both tracks use (see below)
src/domain/ratings.mjs  M2 (ladder)      no-op in M1.3; M2.1 replaces it
src/routes/core.mjs     M1 shared core   /api/players, /api/matches, /api/health
src/routes/fun.mjs      M3 (Eric)        /api/invites, /api/rounds
src/routes/ladder.mjs   M2 (Niklas)      /api/queue, /api/tournaments
src/domain/fun.mjs      M3 (Eric)        invite and round rules
src/domain/ladder.mjs   M2 (Niklas)      queue and tournament rules
public/index.html       M1 shared shell  page shell and nav mount point
public/app.js           M1 shared shell  view registry — ONE added line per view
public/views/core.js    M1 shared        players and matches screens
public/views/core.css   M1 shared        styling for the shared screens
public/views/fun.js     M3 (Eric)        invite and round screens
public/views/fun.css    M3 (Eric)        styling for the fun screens
public/views/ladder.js  M2 (Niklas)      ladder and queue screens
public/views/ladder.css M2 (Niklas)      styling for the ladder screens
public/style.css        M1 shared        base styling only; a track styles itself
test/*.test.mjs         per owner        one file per feature area
```

**Route modules are auto-discovered.** `server.mjs` loads every module in `src/routes/` at
boot and merges their `{method, path, handler}` lists. Adding a route file therefore needs
**no edit to any shared file** — the most likely merge conflict disappears.

**The shared call surface** (`src/domain.mjs`, frozen after M1.3) exports the functions a
track may call: `listPlayers`, `createPlayer`, `listMatches`, `findMatch`, `createMatch`,
`reportMatch`, `confirmMatch`, `disputeMatch`, plus the id and validation helpers. A track's
own rules live in that track's own domain file (`src/domain/fun.mjs`, `src/domain/ladder.mjs`)
and its own route file.

**Styling.** `public/style.css` holds base styling only. Each track styles its own screens in
its own stylesheet (`public/views/fun.css`, `public/views/ladder.css`), loaded by the view
module that needs it. A track may add **one** line to `public/app.js` (its view registration).
Anything beyond that needs both humans.

## 9. Rules that must never break

1. Fun modes never change any rating.
2. Only **confirmed `ranked`** matches change ratings; a disputed match never does.
3. The acting player is trusted from the browser and is **not authentication**. M5.1 replaces
   it.
4. Matches, invites and rounds refer to player ids, never to display names.
5. Data lives outside the release directories and outside git.
6. `/api/health` keeps returning `{"ok": true, "revision": ...}` — the deployment contract.
7. The app keeps listening on `PORT` (default 3000) and binds `0.0.0.0` (or `127.0.0.1`).
8. `npm test` stays green; deployment refuses to switch a release otherwise.
9. The repository root, `.env` and files outside `public/` are never downloadable.
10. Every refused transition stores nothing and returns `{ok: false, error}`.

## 10. Open items for the humans

- **Niklas has not read this document yet.** Until he has, it is a proposal.
- The identity of the acting player is trusted from the browser. Acceptable for the demo,
  replaced by M5.1.
