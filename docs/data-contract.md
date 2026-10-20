# Data contract v1

Owner: M1, jointly (Niklas + Eric). Written 2026-10-20. Frozen when M1.3 merges.
After that, a change to this document is a **new step ID agreed by both humans** (rule G4),
never a quiet edit inside a track branch.

The demo has **no login and no password**. Players identify by a name, but everything the
system stores refers to a stable internal id. That is what lets 42 intra login be attached
later (M5.1) without rewriting matches or ratings.

---

## 1. Player

| Field | Type | Rule |
|---|---|---|
| `id` | string | `p_` + 8 lowercase hex characters. Stable for life, never reused, never changes. Everything else refers to this. |
| `name` | string | 1–40 characters after trimming. **Not unique** — two players may share a name; the demo must still work when they do. |
| `intraId` | string or null | Always `null` in the demo. The slot for the future 42 intra login (M5.1). |
| `rating` | integer | Default `1000`. **Derived and owned by the ladder track** (M2.1). The fun track never writes it. Until M2.1 lands, every rating stays 1000. |
| `createdAt` | ISO 8601 string | When the player was created. |

Rules:
- Matches, invites, rounds, queues and ratings refer to `id`, **never to `name`**.
- A player's `name` may be edited; that must not change any record.
- Deleting a player is not part of the demo. Records reference ids that always resolve.

## 2. Match

| Field | Type | Rule |
|---|---|---|
| `id` | string | `m_` + 8 lowercase hex characters. |
| `mode` | enum | `ranked`, `casual`, `merry-go-round`. New fun modes are added to this list explicitly. |
| `playerIds` | string[] | Player ids, length ≥ 2, no duplicates, all must exist. |
| `state` | enum | `proposed`, `reported`, `confirmed`, `disputed`. |
| `winnerId` | string or null | Required when a score is reported. Must be one of `playerIds`. |
| `score` | object or null | `playerId → games won`, only for the ids in `playerIds`. |
| `reportedBy` | string | The acting player who reported the result. |
| `createdAt`, `updatedAt` | ISO 8601 string | |

### State rules

```
proposed ──(a participant reports a score)──▶ reported
reported ──(the other participant confirms)──▶ confirmed
reported ──(the other participant disputes)─▶ disputed
```

- `confirmed` and `disputed` are final.
- A `disputed` match never changes ratings and stays visible to both participants.
- **Ranked** (`mode: "ranked"`): the report must be confirmed by the other participant.
  Only `confirmed` ranked matches feed ratings.
- **Casual** (`mode: "casual"`): the report is stored as `confirmed` immediately. The other
  participant still sees it, but there is no dispute step for casual — it would change
  nothing, because casual never touches ratings.
- **Merry-go-round** (`mode: "merry-go-round"`): the match is a summary record only. The
  ordering lives in the round (§4). It never touches ratings.

### Who may report and who must confirm

- The **acting player** is the player the browser currently acts as. The demo has no
  authentication: the browser sends a player id and the server trusts it. This is **not a
  security boundary**; M5.1 replaces it with a real login.
- Only a participant of the match may report it.
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
| `createdAt`, `updatedAt` | ISO 8601 string | |

Rules:
- An invite to yourself or to a nonexistent player is refused and stores nothing.
- A declined invite stores no match.
- Accepting an invite creates a `casual` match in state `proposed` with both players as
  participants. The score is filled in later with the normal match report.

## 4. Round (merry-go-round)

Used by the fun track (M3.3).

| Field | Type | Rule |
|---|---|---|
| `id` | string | `r_` + 8 lowercase hex characters. |
| `playerIds` | string[] | At least 3 player ids, no duplicates, all must exist. Two players is refused. |
| `state` | enum | `running`, `finished`. |
| `eliminations` | string[] | Player ids in elimination order. A player may appear at most once. |
| `winnerId` | string or null | The last player standing. Set when the round finishes. |
| `createdAt`, `updatedAt` | ISO 8601 string | |

Rules:
- A round finishes when exactly one player is left; that player is the winner.
- Eliminating an already eliminated player is refused and stores nothing.
- A round never touches ratings.

## 5. Ratings (owned by the ladder track)

- Start **1000**, **K-factor 32** (decided 2026-10-20).
- Derived from **confirmed `ranked` matches only**. Replaying the confirmed match history
  gives the same ladder.
- The fun track **never** writes `player.rating`. Casual and merry-go-round results leave
  every rating exactly unchanged. This is a review checkpoint on every fun-track step.
- The ladder track implements the derivation in M2.1. Until then, every rating is 1000.

## 6. Where the data lives

- Directory: `process.env.DATA_DIR`, default `~/.local/share/vibecode-workshop/data/`.
- One file: `store.json` in that directory.
- **Never** inside a release directory, never inside the repository, never in git.
- Loaded once at boot into memory, written back **atomically** (write a temporary file in
  the same directory, then rename over `store.json`) after every change, so a crash mid-write
  cannot corrupt the store.
- The store module is the **only** writer. Route handlers call it; nothing else touches the
  file.

## 7. HTTP surface

JSON over HTTP on the same server. Every response is JSON.

- Errors: `{"ok": false, "error": "<human readable sentence>"}` with a 4xx status.
- Success: `{"ok": true, ...}` or a bare object/array for list endpoints.

| Method | Path | Body / result |
|---|---|---|
| GET | `/api/health` | `{"ok": true, "revision": "..."}` — unchanged, deployment contract |
| GET | `/api/players` | array of players |
| POST | `/api/players` | `{name}` → the created player |
| GET | `/api/matches` | array of matches, newest first |
| POST | `/api/matches` | `{mode, playerIds, winnerId, score, actor}` → the match |
| POST | `/api/matches/:id/confirm` | `{actor}` → the updated match |
| POST | `/api/matches/:id/dispute` | `{actor}` → the updated match |
| GET | `/api/invites` | array of invites |
| POST | `/api/invites` | `{toPlayerId, actor}` → the invite |
| POST | `/api/invites/:id/accept` | `{actor}` → `{invite, match}` |
| POST | `/api/invites/:id/decline` | `{actor}` → the invite |
| GET | `/api/rounds` | array of rounds |
| POST | `/api/rounds` | `{playerIds, actor}` → the round |
| POST | `/api/rounds/:id/eliminate` | `{playerId, actor}` → the updated round |

**Track prefixes** so the two tracks rarely touch the same router file:
ladder track owns `/api/queue`, `/api/tournaments`; fun track owns `/api/invites`,
`/api/rounds`. The shared part above belongs to M1 and is frozen after M1.3.

## 8. File-level ownership (so the two tracks rarely collide)

```
server.mjs              M1 shared core   (frozen after M1.3)
src/store.mjs           M1 shared core   persistence
src/domain.mjs          M1 shared core   players, matches, state machine, ids
src/routes/core.mjs     M1 shared core   /api/players, /api/matches, /api/health
src/routes/fun.mjs      M3 (Eric)        /api/invites, /api/rounds
src/routes/ladder.mjs   M2 (Niklas)      /api/queue, /api/tournaments
public/index.html       M1 shared shell  page shell and nav mount point
public/app.js           M1 shared shell  view registry — ONE LINE per view
public/views/core.js    M1 shared        players and matches screens
public/views/fun.js     M3 (Eric)        invite and round screens
public/views/ladder.js  M2 (Niklas)      ladder and queue screens
public/style.css        M1 shared        styling
test/*.test.mjs         per owner        one file per feature area
```

- A route module exports `{method, path, handler}` and the server assembles the list. Adding
  a route must not require editing another route module.
- A view module exports a render function and registers itself with one line in
  `public/app.js`. That single line is the most likely merge conflict; keep it additive.
- A track may only add files inside its own area and add **one line** to `public/app.js` and
  **one line** to the route registry. Anything more needs both humans.

## 9. Rules that must never break

1. Fun modes never change any rating.
2. Matches, invites and rounds refer to player ids, never to display names.
3. Data lives outside the release directories and outside git.
4. `/api/health` keeps returning `{"ok": true, "revision": ...}` — the deployment contract.
5. The app keeps listening on `PORT` (default 3000) and binding `0.0.0.0`.
6. `npm test` stays green; deployment refuses to switch a release otherwise.
7. The repository root, `.env` and files outside `public/` are never downloadable.

## 10. Open items for the humans

- Niklas has not read this document yet. Until he has, it is a proposal.
- The identity of the acting player is trusted from the browser. Acceptable for the demo,
  replaced by M5.1.
