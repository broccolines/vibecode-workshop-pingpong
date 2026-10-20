# Agent routing — milestones, tasks and context windows

Companion to PLAN.md. PLAN.md owns *what* we build and in which order. This document owns
*who* runs each piece, *what context* each session is allowed to see, and *what proves it
is done*. Nothing here overrides IDEA.md, PLAN.md or AGENTS.md.

Written by the project lead on 2026-10-20 after reading IDEA.md, PLAN.md, `.ai/rules.md`,
`.ai/roles/*`, `.ai/team/*`, `docs/*` and the starter code.

---

## 0. How to read this document

- **Milestone** = a set of steps owned by one milestone lead (M1, M2, M3, M4).
- **Step** = one branch, one reviewable PR, one permanent ID (M1.1, M2.3, …).
- **Session** = one agent conversation with one job. Sessions are cheap; roles are not.
- **Context packet (CX-n)** = the exact set of files and facts a session may read. Everything
  else is out of its window on purpose.
- **Gate** = the check that must pass before the next session starts.

Two senses of "context window" are used here and both matter:

1. **Information scope** — which files, SHAs and facts a session may see. This is what keeps
   reviews independent and coders from wandering into the other track.
2. **Model budget** — which model/provider each role gets. The reviewer and the partner check
   get the strongest reasoning available, because they are the only ones whose job is to doubt.

---

## 1. Audit of the starting state (facts, checked 2026-10-20)

| Fact | Where | Consequence |
|---|---|---|
| `main` == `origin/main` at `82ebb23` "created plan"; working tree clean | `git log`, `git status` | Plan docs were pushed straight to `main` without a PR. Docs only, no code, so no code review was skipped — but AGENTS.md rule 7 wants PRs. This routing doc goes through a PR. |
| App is the static starter: `server.mjs` serves `public/index.html` + `/style.css` + `/api/health`; every other method is `405` | `server.mjs`, `public/` | There is **no data layer, no API, no persistence**. Everything in M1.3 onward is greenfield. |
| No `docs/data-contract.md`, no `.ai/work/` directory | repo listing | M1.2 and the milestone briefs have no artefacts yet. |
| `npm test` → 21 passed, 0 failed locally | this session | Green baseline. `npm test` must stay green; deploy refuses to switch a release when it fails. |
| Local Node is **v20.11.1**, `package.json` requires `>= 22` | `node --version` | The starter validation already hit this trap. Every coder session must run Node 22 explicitly (`npx -y node@22 --test`, or the validated Node 22 binary), and must say which runtime it used in `validation.md`. |
| **`gh` is not installed** on this laptop | `which gh` | The committer cannot open or merge PRs as written. Install GitHub CLI before M1.1, or agree a manual web-UI fallback with the human. |
| No team handout (`team-NN.md`) in the repo, by design | repo listing | M1.1 needs the human to put the SSH command, port, known-hosts and public URL into `.workshop.local.md` (git-ignored). Private details never enter a commit. |
| Data must live outside release dirs | `.ai/rules.md`, `docs/deploy.md` | Target `~/.local/share/vibecode-workshop/data/`, not the release folder, not the repo. |
| The starter is dependency-free Node | `package.json` | `npm ci` is instant; the 2 GB build scope is never a factor. This is an asset, see §9 D1. |

---

## 2. Milestone map, gates and the ordering rule

```
        M1.1 ──▶ M1.2 ──▶ M1.3 ──▶ M1.4 ──┬─▶ M2.1 ──▶ M2.2 ──▶ M2.3 ──▶ M2.4 ┐
                       (joint, one lead)     │                                     ├─▶ M4
                                            └─▶ M3.1 ──▶ M3.2                   │
                                                    M3.3 ──▶ M3.4              │
```

| Gate | Meaning | Blocks |
|---|---|---|
| **G0 — live** | Assigned HTTPS URL reachable, `/api/health` reports the intended revision, teammate opens it on a phone | M1.2 |
| **G1 — contract frozen** | `docs/data-contract.md` reviewed by both humans, shared storage + API surface decided, committed | M2.1, M3.1, M3.3 |
| **G2 — first record** | M1.3 merged: two players, a recorded result, survives reload, second visitor, app restart | M2.1, M3.1, M3.3 |
| **G3 — milestone accepted** | Both humans completed the journey on phones at the live URL | Any release of M1 |
| **G4 — contract change window closed** | After G2, changes to the shared format need both humans and a **new step ID** (e.g. M1.5), never a quiet edit in a track branch | Both tracks |

**Ordering rule inside M2/M3.** The two tracks share `main` and the shared core. One step is
merged at a time; the committer of the second track rebases or waits. Details in §6.

**Nothing starts before its gate.** If a dependency has not merged, the milestone lead stops
and reports the blocker instead of inventing a workaround.

---

## 3. Context packets

Each packet lists what a session **may** read, what it **must not** read, and roughly how much
it reads. A session that needs something outside its packet asks the milestone lead; it does
not go looking.

### CX-0 — Shared rules (every session, including the human-facing ones)
**Read:** `AGENTS.md` (incl. the framework replacement contract), `.ai/rules.md`, `.ai/pitfalls.md`,
the one role card `.ai/roles/<role>.md`.
**Why:** every rule in AGENTS.md overrides the agent's defaults, and the deployment contract is
easy to break by accident.
**Size:** small, always.

### CX-1 — Plan layer (milestone leads only)
**Read:** CX-0 + `IDEA.md`, `PLAN.md`, `.ai/context.md`, `.ai/team/<owner>.md`, `docs/workflow.md`,
`docs/data-contract.md` (once it exists), `docs/agents.md`.
**Purpose:** only a milestone lead sees the whole roadmap, because only it resolves routine
questions instead of escalating them.
**Must not:** treat PLAN.md as a script to execute without checking the real state of the repo.

### CX-2 — Step context (coder)
**Read:** CX-0 + `.ai/work/<STEP>/brief.md` + the files the brief names + `docs/data-contract.md`
+ the base SHA's tree. `PLAN.md` only for the row of its own step and the shared-format section.
**Given in the dispatch prompt:** step ID, brief path, branch name, base SHA, dependency SHAs,
anything the brief deliberately leaves out.
**Must not:** the other track's briefs, the reviewer's expectations, the milestone lead's
opinions about future steps, or any "while you are there" wish.
**Size target:** under ~12k tokens of reading. If the coder needs more than that, the brief is
too big — split the step, do not widen the window.

### CX-3 — Review context (reviewer)
**Read:** CX-0 + `.ai/work/<STEP>/brief.md` + `docs/data-contract.md` + `.ai/work/<STEP>/validation.md`
+ `git diff <base>..<head>` (stat first, then targeted files).
**Must not:** the coder's chat reasoning, the milestone lead's narration, the plan for the next
step. The reviewer judges only what is committed.
**Also:** re-run the checks whose claimed result matters (`npm test` with Node 22) and, for UI
steps, start the app themselves and walk the journey at desktop and phone widths.
**Verdict:** APPROVE / REQUEST CHANGES covering only the named head SHA.

### CX-4 — Commit context (committer)
**Read:** CX-0 + `.ai/work/<STEP>/brief.md`, `validation.md`, `review.md` + `.github/pull_request_template.md`
+ the branch tip SHA.
**Must not:** re-interpret the outcome, change implementation, or merge without both an APPROVE
and the human partner's acceptance.

### CX-5 — Partner check (the other human's own session)
**Read:** the PR diff + `.ai/work/<STEP>/brief.md` + the running app at the live URL (or a local
dev server with the same code).
**Three questions only:** does it deliver the outcome, did it touch unrelated work, does it work
on a phone next to the table?
**Prefer a different provider/model family** from the coder (AGENTS.md). Record which provider
actually ran it.

### CX-6 — Human-only
Connection details from the organiser handout, the assigned URL, SSH port, key path, the public
URL, taste decisions, scope changes, release instructions. These live in `.workshop.local.md`
and in the humans' heads — never in a commit, a brief, or a prompt that will be pasted into a
shared screen.

### Model allocation per role

| Role | Model | Why |
|---|---|---|
| Coder | mid tier (Sonnet-class) | Cheap, fast iteration; the brief removes the need for deep reasoning about scope. |
| Reviewer | strong tier (Opus-class) | The only agent whose output is allowed to block work. Different family preferred. |
| Partner check | the other human's provider (e.g. Codex) | Cross-family independence; it is a human gate anyway. |
| Committer | mid tier | Mechanical, auditable work: SHA checks, PR, merge, records. |
| Milestone lead | whatever the human has | Judgement, not throughput. |
| Project lead | not in the loop per step | Owns scope, taste and release decisions only. |

---

## 4. Dispatch prompts (paste verbatim into a fresh session)

**Milestone lead** (human opens it, fresh session, in the owner's clone):
```
Read AGENTS.md, .ai/roles/milestone-lead.md, docs/agent-routing.md and the step brief in
.ai/work/<STEP>/. You are milestone lead for <MILESTONE>. Audit the real state first, then
write .ai/work/<STEP>/brief.md from .ai/templates/brief.md with the real base SHA, the branch
name and acceptance cases. Show it to the human and wait for the OK before dispatching anyone.
```

**Coder** (dispatched by the milestone lead):
```
Step <STEP>. Read AGENTS.md, .ai/roles/coder.md, .ai/work/<STEP>/brief.md and
docs/data-contract.md if it exists. Branch <branch> from base SHA <sha>. Implement only the
brief. Use Node 22 for every check. Run the checks that fit the risk, save actual results to
.ai/work/<STEP>/validation.md with base and head SHA, commit, and report the exact head SHA.
Do not merge, approve or push.
```

**Reviewer** (dispatched by the milestone lead, after the coder returns):
```
Step <STEP>, base <sha>, head <sha>. Read AGENTS.md, .ai/roles/reviewer.md,
.ai/work/<STEP>/brief.md, .ai/work/<STEP>/validation.md and docs/data-contract.md. Review
git diff <sha>..<sha> in full. Re-run the checks that matter, walk the browser journey for UI
steps, write .ai/work/<STEP>/review.md with the template, and give APPROVE or REQUEST CHANGES.
Do not edit implementation files. Do not merge.
```

**Committer, phase 1** (after APPROVE):
```
Step <STEP>, approved head SHA <sha>. Read AGENTS.md, .ai/roles/committer.md,
.ai/work/<STEP>/{brief,validation,review}.md and docs/workflow.md. Confirm the branch tip is
still <sha>, commit review.md as a report-only commit, write pr.md from the PR template, push
and open the PR in broccolines/vibecode-workshop-pingpong only. Return the PR link. Do not
merge yet.
```

**Committer, phase 2** (after the partner accepted):
```
The partner accepted PR <link>. Re-check gh pr checks, confirm the head is still <sha>, merge
into main in broccolines/vibecode-workshop-pingpong, then update the PLAN.md row,
.ai/context.md and write .ai/sessions/<date>-<step>.md. Do not deploy.
```

**Partner check** (the other human, own session, own provider):
```
Review PR <link> for step <STEP> against .ai/work/<STEP>/brief.md. Does it deliver the
outcome, did it change unrelated work, does the journey work on a phone? Answer with accept or
changes requested, plus the provider and model you used.
```

---

## 5. Step-by-step assignment

### M1 — Shared foundation (joint, one milestone lead)

Milestone lead: **one fresh session**, in the clone of the human who has GitHub CLI
authenticated (the fork owner) — see §9 D2. Eric owns the *content* of M1.3; the milestone lead
owns the *process*. Both humans gate every merge.

| Step | Sessions, in order | Gate |
|---|---|---|
| **M1.1** live starting point | milestone lead (writes brief) → **deployer session** in the guest shell (CX-0 + CX-6 + `docs/deploy.md`) → human gate: both humans open the URL on a phone | G0 |
| **M1.2** shared format | milestone lead drafts `docs/data-contract.md` → Niklas reviews → Eric reviews → committer merges the doc | G1 |
| **M1.3** first recorded match | milestone lead (brief) → coder (CX-2) → reviewer (CX-3) → committer phase 1 → **Niklas's session partner check** (CX-5) → committer phase 2 | G2 |
| **M1.4** journey on phones | both humans, no agents; observed problems become new step IDs | G3 |

**M1.1 — details.** No code changes. The deployer session runs `npm run deploy` on the guest
as `vc-team`, then `npm run smoke -- https://<assigned-url>` **from a laptop** (the guest cannot
call its own public URL; Cloudflare challenges the datacenter IP — AGENTS.md rule 6). Evidence:
health JSON, `git rev-parse HEAD` on the guest, smoke output, phone screenshot, written to
`.ai/work/M1.1/validation.md`.
*Blocker to clear before anything else:* the organiser handout is not in the repo. The human
puts SSH command, port, known-hosts path and public URL into `.workshop.local.md` (git-ignored).
*Second blocker:* `gh` is not installed → install it, or agree the manual PR fallback.

**M1.2 — details.** Little or no code, but it is the highest-leverage step of the whole
project: it is what lets two tracks work in parallel without inventing incompatible data.
Candidate decisions to put in front of both humans (the milestone lead verifies, the humans
decide):
- Player: stable internal ID (`p_…`) + display name + optional empty `intraId` field; two
  players may share a name; every match and rating refers to the **ID**.
- Match: ID, mode (`ranked` | `casual` | `merry-go-round` | future fun modes), participants as
  IDs (2 or more), state (`proposed` → `reported` → `confirmed` / `disputed`), score or placings,
  `reportedBy`, timestamps.
- Who may report: the **acting player** — the browser must know who you are. This is the piece
  PLAN.md does not spell out today, and M2.3 (loser confirms/disputes) and M3.1 (invitee
  accepts) both depend on it. See §9 D3.
- Ratings: derived from **confirmed `ranked` matches only**; casual and fun modes never touch Elo.
- Storage: one JSON store under `~/.local/share/vibecode-workshop/data/` (path overridable by env
  var), written atomically, loaded once at boot, kept in memory, flushed on change; the store
  module is the **only** writer, both tracks call it, nobody edits files directly.
- API surface: JSON over `/api/*`, one prefix per feature (`/api/players`, `/api/matches`,
  `/api/queue`, `/api/tournaments` for L; `/api/invites`, `/api/rounds` for F), so the two tracks
  rarely touch the same router file.
- Change rule after G2: a contract change is a new M1.x step agreed by both humans.

**M1.3 — details.** The first real code step and the base both tracks build on. Candidate
acceptance cases for the brief (milestone lead confirms, humans confirm):
- normal: two players are created, a 2–1 result is recorded, both players see it after a reload
  and on a second device;
- **acting player**: the page knows who you are (pick or create a player, remembered in the
  browser) — without this, M2.3 and M3.1 cannot exist;
- empty state: with no players or matches, the page says what to do first;
- failure: reporting against a nonexistent player, a match with no winner, or a match with the
  same player twice is refused with a clear message and stores nothing;
- restart: the data is still there after the app restarts;
- boundary: the store is outside the release directory; `npm test` stays green; `/api/health`
  still returns the deployed revision; the repo root and `.env` stay undownloadable.
*Browser task:* join and record a result at 1440×1000 and 375×812, one-handed, next to a table.

**M1.4 — details.** Both humans, no agent work. Each observation becomes a numbered step
(`M1.5`, `M1.6`, …) or is explicitly deferred with a reason in `PLAN.md`. Only after this do we
ask for the **M1 release** (committer deploys the accepted SHA, smoke, phone check).

### M2 — Ladder track (Niklas)

Milestone lead: a fresh session in **Niklas's own clone** of the fork. Coder: mid-tier model.
Reviewer: strong model. Partner check: **Eric's session, different provider**.

| Step | Outcome | Depends on | Notes for the brief |
|---|---|---|---|
| **M2.1** | Confirmed ranked matches update both Elo ratings; the ladder page shows ranks | M1.3 | Rating is a **derived** value: recompute from the confirmed match history, so replaying history gives the same ladder. 1000 start, K=32. The ladder is read-only here. |
| **M2.2** | A player joins the ranked queue and is paired with a waiting player; both see who to play | M2.1 | One player alone waits and is never paired with themselves; a second joiner creates **exactly one** pairing; leaving removes the player before pairing. Decide whether pairing considers rating. |
| **M2.3** | The loser confirms or disputes a reported ranked result; only confirmed results change ratings | M2.1 | A disputed result leaves both ratings untouched and is visible to both players. The losing side is the one who acts — this is where the acting-player rule from M1.2 earns its keep. |
| **M2.4** | An organiser creates a single-elimination tournament; results advance the bracket | M2.3 | Stretch. Odd player counts need byes and nobody plays twice in a round. |

### M3 — Fun track (Eric)

Milestone lead: a fresh session in **Eric's own clone** of the fork. Coder: mid-tier model.
Reviewer: strong model. Partner check: **Niklas's session, different provider**.

| Step | Outcome | Depends on | Notes for the brief |
|---|---|---|---|
| **M3.1** | A player invites a named player to a casual match; the invitee accepts or declines | M1.3 | An invite to yourself or to a nonexistent player is refused; a declined invite records no match. The invite refers to the player's **ID**, not the display name. |
| **M3.2** | Casual results are recorded and visible but never change Elo | M3.1 | Hard rule from the ladder track's point of view: after a casual match both ratings are **exactly** unchanged. The reviewer checks this. |
| **M3.3** | Merry-go-round: 3 or more players start a round, eliminations are recorded, a winner is shown | M1.3 | 2 players is refused (needs 3+); 3 players and two eliminations produce one winner; nobody is eliminated twice; one tap per elimination on a phone. |
| **M3.4** | One more fun mode, chosen by Eric after M3.3 | M3.3 | New mode ID proposed by Eric, added to PLAN.md before it is briefed. |

### M4 — Demo (joint)

One end-to-end run on phones at the live URL: queue → play → confirm → ladder, then
invite → casual, then merry-go-round. The milestone leads stop; the humans run it.
Release of the merged SHA is a **human instruction**, never an agent's initiative.

---

## 6. Parallel-track ownership and integration order (M2 || M3)

Two clones, two milestone leads, one `main`.

| Path | Owner | Rule |
|---|---|---|
| storage module, domain model, HTTP router, shared UI shell | M1 (frozen at G2) | Changing it after G2 needs both humans and a new M1.x step |
| `elo`, `queue`, `tournament` modules + their API prefixes + their screens | Niklas (M2) | free to change inside M2 |
| `invite`, `round` modules + their API prefixes + their screens | Eric (M3) | free to change inside M3 |
| UI route registry / navigation (one small shared file) | **shared, one owner at a time** | Whoever touches it merges first; the other rebases and re-runs its own journey. This is the most likely conflict point — keep the file tiny and additive. |

Integration order rule: **one merge at a time.** The second track's committer waits for the
first to land, then rebases and re-runs its own acceptance cases (a merged change to the shared
core can invalidate the other track's evidence). If a step's reviewed SHA no longer sits on the
new `main` in a compatible way, it needs a re-review — that is the normal case, not a failure.

---

## 7. Evidence map

Every step, one directory: `.ai/work/<STEP>/`

| File | Written by | Contains |
|---|---|---|
| `brief.md` | milestone lead | outcome, audit, acceptance cases, base SHA, branch, boundaries |
| `validation.md` | coder | base/head SHA, every command and its real output, browser evidence or the reason it is missing, limitations, which Node runtime was used |
| `review.md` | reviewer | reviewed base/head SHA, what was checked, findings with severity and concrete failing case, APPROVE / REQUEST CHANGES |
| `pr.md` | committer | PR body from the template, links to the three files above |

Then the session trail in `.ai/sessions/<date>-<step>.md` and the step's row in `PLAN.md`
(state + PR link). GitHub PR state is the board; we link it, we do not duplicate it.

---

## 8. Risks, cut line and the shape of the day

### Risk register

| # | Risk | Signal | Response |
|---|---|---|---|
| R1 | `gh` missing → no PR, no merge | `which gh` fails | Install before M1.1. Fallback: manual PR in the web UI, committer still records SHAs. |
| R2 | Wrong Node runtime → green locally, red on the guest | `node --version` < 22 | Every session runs Node 22 explicitly and states it in `validation.md`. |
| R3 | Contract drift between parallel tracks | two branches define "match" differently | Contract frozen at G1; changes after G2 become a new agreed M1.x step. |
| R4 | Merge conflicts in shared files | `git diff --stat` shows the registry/shell | Ownership map in §6; one merge at a time; rebase + re-verify after every shared-core merge. |
| R5 | Demo data pollution | `~/.local/share/vibecode-workshop/data/` filled with test matches | Agree a reset procedure for **our own** data before the demo (documented, team-owned path only — never another team's data). |
| R6 | "Players report honestly" is an untested assumption | reported results nobody checks | Mitigated by M2.3 confirm/dispute. If time runs short, at minimum record **who** reported, and say the assumption is untested. |
| R7 | Reviewer cannot judge UI from a diff | "the page looks fine" in `validation.md` | Reviewer starts the app itself; without a browser tool it must state that the journey was **not verified**. |
| R8 | Two humans, one checkout, one port | `EADDRINUSE` on 3000 | Separate clones per human; local dev on `PORT=3001`. |
| R9 | Context drift between sessions | brief references something that does not exist | The milestone lead dispatches real SHAs and paths, never prose summaries; a session that finds a missing dependency stops and reports. |

### Cut line for a one-day workshop

| Priority | Steps | Why |
|---|---|---|
| **P0 — must ship** | M1.1, M1.2, M1.3, M1.4, M2.1, M2.2, M2.3, M3.1, M3.2 | The agreed demo journey: queue → play → confirm → ladder, plus one casual invite. Without M1.3 nothing else exists; without M2.1–M2.3 there is no ladder. |
| **P1 — first to cut** | M3.3 merry-go-round | It is the most visible "fun" item and depends only on M1.3, so it can be picked up late without blocking anything. |
| **P2 — stretch** | M2.4 tournament, M3.4 extra mode | Stretch goals in IDEA.md. A visible half-finished bracket is worse than no bracket. |

Order of sacrifice when the clock runs out: **M3.4 → M2.4 → M3.3**, and say so in PLAN.md
rather than leaving a silent hole. A cut mode is a decision for the human, not a silent omission.

### Shape of the day

| Block | Content | Rule |
|---|---|---|
| A | M1.1 → M1.4 (joint, one lead) | Nothing in M2/M3 starts before G2. |
| B | M2 and M3 in parallel (two clones, two leads, cross-review) | One merge at a time. |
| C | M4: one phone run of the whole journey, then the release | Release only on an explicit human instruction. |

---

## 9. Open decisions for the human

| ID | Decision | Recommendation | Consequence of not deciding |
|---|---|---|---|
| **D1** | Keep the dependency-free Node starter, or replace the framework (Next.js/Vite)? | **Keep the starter.** `npm ci` is instant, the 2 GB build scope never bites, the deploy contract is already satisfied and tested. A framework swap buys nicer DX and costs contract risk and time we need for M2/M3. If a swap is chosen, it must be its own step (M1.3a) that satisfies the AGENTS.md replacement contract, and it must land **before** the two tracks split. | The two tracks may build on different assumptions about the shared core. |
| **D2** | Who runs the M1 milestone lead, and in whose clone? | The **fork owner** (Niklas, author of `82ebb23`) runs the M1 lead and holds `gh` auth; Eric's clone is reserved for M3 and the partner check of M1.3. | Two writers in one checkout; PRs opened against the wrong repo. |
| **D3** | Is "acting player" (the page knows who you are) part of M1.3? | **Yes.** M2.3 (loser confirms/disputes) and M3.1 (invitee accepts) both need it. Without it, both tracks must invent identity separately and the shared format breaks at the seam. | M2 and M3 each invent their own identity mechanism → contract drift at G4. |
| **D4** | Install GitHub CLI before M1.1, or use the manual web-UI PR flow for the whole day? | **Install it.** The committer role, the partner check and CI checks all assume `gh`. | The committer role stalls at every step. |
| **D5** | Confirm the cut line order (M3.4 → M2.4 → M3.3) and the P0 set. | Accept as written. | The team discovers the shortfall during the demo instead of in the plan. |

Still open from the previous session: **Eric confirms that "invite" means inviting inside our
app, not 42 intra.** PLAN.md and `.ai/team/eric.md` assume inside-our-app. Confirm before M3.1
is briefed.

---

## 10. What the project lead does next

1. Get D1–D5 answered (D2, D4 and the `gh` install can happen immediately and in parallel).
2. Get the organiser handout into `.workshop.local.md` and install GitHub CLI.
3. Hand M1 to a milestone lead session: `/milestone-lead M1` in the fork owner's clone.
4. Hold the gates: no M2/M3 session before G2, no release before G3.
5. Keep PLAN.md as the status board: every merged step gets its row and PR link updated by the
   committer, and the cut line is applied there if the day runs short.
