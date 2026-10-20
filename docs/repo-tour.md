# Repo tour for newcomers

A guided tour of this repository: where things live, what each file is for, and which
commands matter. Written by the project lead on 2026-10-20 for teammates who are new to
agentic coding. Nothing here changes the rules — `AGENTS.md` still wins.

---

## 1. The repo has two separate worlds

Beginners usually mix these up:

- **GitHub** — where the code and its *history* live. Branches, PRs, reviews.
- **The workshop server** — where the app *runs*. Deployment, live URL, stored data.

A commit on GitHub does **not** change the live site. `npm run deploy` does.

---

## 2. GitHub side: the vocabulary you need

| Word | Meaning here |
|---|---|
| **fork** | Your team's copy of the starter. `ikodo0/vibecode-workshop` = the original workshop starter (read-only, don't PR there). `broccolines/vibecode-workshop-pingpong` = **your fork — every PR goes here.** |
| **clone** | Your local copy on your laptop. You run `git` in a folder, not on github.com. |
| **remote** | The GitHub address. You have exactly one: `origin` → your fork. |
| **branch** | A parallel line of work. `main` = reviewed, shippable code. `m1.3-first-match` = work in progress. |
| **commit** | A named snapshot. The SHA (`82ebb23`) is its permanent fingerprint — evidence files cite SHAs so nobody can argue about what was reviewed. |
| **PR** | "Please merge this branch." The **unit of review**. One step = one branch = one PR. |
| **CI** | GitHub runs `npm ci && npm test` on every push and PR (`.github/workflows/check.yml`) and reports red or green. **It does not block merging by itself** — branch protection is not assumed, so the committer must check it (see `docs/workflow.md`). |

### Branches at the time of writing

```
main                82ebb23  [origin/main]              ← reviewed baseline
* plan-agent-routing         (a branch; its tip moves)  ← planning docs, not yet merged
```

`plan-agent-routing` holds the routing plan and `steps.txt`. `main` is untouched. **Nothing
is merged yet** — a PR has to be opened on GitHub. Branch tips move; check
`git log --oneline <branch>` for the current SHA rather than trusting a SHA written in prose.

### The commands you'll actually use

```sh
git status                              # what changed, what branch am I on
git log --oneline -5                    # last 5 commits
git diff                                # changes not yet committed
git diff main...m1.3-first-match        # what this branch adds vs main
git checkout -b m1.3-first-match        # new branch
git push -u origin m1.3-first-match
```

**Never** run `git reset --hard`, `git push --force`, or `git checkout .` — they destroy other
people's work, which AGENTS.md explicitly forbids.

---

## 3. The files, by purpose

### Group A — *What* we are building (thinking files)

| File | Job | Who writes it |
|---|---|---|
| `IDEA.md` | The problem: who has it, what they can do by demo day, what is deliberately deferred | You (humans) |
| `PLAN.md` | Milestones, permanent step IDs (M1.1, M2.3…), dependencies, each step's state and PR link | Humans agree; the committer updates the status |
| `steps.txt` | **Who does what**: gates, context packets per agent role, dispatch prompts, risks, cut line | Project lead |
| `docs/agent-routing.md` | The same routing plan in richer Markdown | Project lead |

> Read `PLAN.md` for *what*, `steps.txt` for *who*.

### Group B — *How* we work (the working agreement)

| File | Job |
|---|---|
| `AGENTS.md` | **The most important file.** Shared rules, responsibilities, and the deployment contract. Every agent reads it first. |
| `CLAUDE.md` | A symlink → `AGENTS.md`. Same content, different tool name. Not a second rulebook. |
| `.ai/rules.md` | Hard constraints learned from this project (port 3000, data outside release dirs, no secrets). It grows over time. |
| `.ai/pitfalls.md` | Incident log: symptom → cause → correction. Empty right now. |
| `.ai/context.md` | "What we are doing right now." Updated after every merged step. |

### Group C — The agent machinery

| Path | Job |
|---|---|
| `.ai/roles/project-lead.md` | What the project lead is allowed to do |
| `.ai/roles/milestone-lead.md` | Plans one milestone, writes briefs, dispatches the other roles |
| `.ai/roles/coder.md` | Implements exactly one step, commits it, writes the validation evidence |
| `.ai/roles/reviewer.md` | Independently judges the committed diff |
| `.ai/roles/committer.md` | Verifies the SHA, opens/merges the PR, records it |
| `.ai/templates/brief.md` | Blank form for a step brief (what a coder receives) |
| `.ai/templates/review.md` | Blank form for a review |
| `.ai/templates/handoff.md` | Blank form for a session handoff |
| `.ai/team/niklas.md`, `.ai/team/eric.md` | What each human owns and what they must *not* touch |
| `.claude/commands/*.md` | Slash commands: `/project-lead`, `/milestone-lead M2` |
| `.claude/agents/*.md` | Subagent definitions (coder = Sonnet, reviewer = Opus, committer = Sonnet) |

### Group D — The evidence trail

This is the part beginners never expect, and it is the whole point of agentic work: **the
agents write down what they did, so you can check it instead of trusting a chat message.**

```
.ai/work/M1.3/
  brief.md      ← what was asked (milestone lead)
  validation.md ← what the coder ran and saw (coder)
  review.md     ← what the reviewer checked and approved (reviewer)
  pr.md         ← the PR body (committer)

.ai/sessions/2026-10-20-agent-routing.md   ← handoff notes from a session
.ai/validation/starter.md                   ← what the starter itself was tested for
```

`.ai/work/` does not exist yet — it appears with the first step brief.

### Group E — The actual code (small today)

| File | Job |
|---|---|
| `server.mjs` | The whole backend. 52 lines: serves `public/`, answers `/api/health`, answers `404` for unknown paths and `405` for methods other than GET/HEAD. **No data layer yet.** |
| `public/index.html` | The page. Only files in `public/` are web-accessible — the repo root is never served. |
| `public/style.css` | Styling. |
| `test/app.test.mjs` | 3 real HTTP tests: page + CSS + health, path traversal blocked, HEAD/405. |
| `test/deploy.test.mjs` | 18 tests proving the deploy script behaves (locks, rollback, memory limits). |
| `package.json` | The npm scripts and the Node ≥ 22 requirement. |
| `package-lock.json` | Exact dependency versions. **Must stay committed** — `npm ci` uses it during deploy. |

### Group F — Deployment tooling (do not touch without reading AGENTS.md)

| File | Job |
|---|---|
| `scripts/deploy.mjs` | Deploys the checked-out `main` to the workshop guest: runs tests, archives the commit into a release dir, swaps the `vc-app` user service, health-checks, rolls back on failure. |
| `scripts/smoke.mjs` | Checks that the live URL serves the intended revision. Run on your **laptop** — the server cannot call its own public URL (Cloudflare challenges datacenter IPs). |
| `scripts/doctor.mjs` | Environment diagnosis: tools, Git remotes, repo state. |

### Group G — GitHub automation and docs

| File | Job |
|---|---|
| `.github/workflows/check.yml` | CI: Node 22 → `npm ci` → `npm test` on every push and PR. |
| `.github/pull_request_template.md` | The four sections every PR body must have. |
| `docs/connect.md` | Getting the SSH key, cloning the fork, reaching the guest. |
| `docs/deploy.md` | Deployment recipes and the framework-replacement contract. |
| `docs/workflow.md` | How one step flows: brief → coder → reviewer → committer. |
| `docs/agents.md` | How to install and use the tools (Claude Code, Codex, …). |
| `docs/feedback.md`, `docs/organiser.md`, `docs/tools.md` | Observation, preflight checklist, optional integrations. |
| `README.md` | Start here: fork → connect → run → lead prompt. |
| `.gitignore` | Ignores `node_modules/`, `.env`, `.workshop.local.md` (private connection notes), `.ai/browser/`. |
| `.env.example` | The shape of a local env file, with no secrets. |

---

## 4. How it fits together (the life of one step)

```
PLAN.md row "M1.3 draft"
        │
        ▼  milestone lead writes
.ai/work/M1.3/brief.md  ──────────────────┐
        │                                 │
        ▼  coder (branch m1.3-first-match)│  reviewer reads ONLY these three
git commit → implementation + validation.md│  + the committed diff, not the chat
        │                                 │
        ▼  reviewer                        ▼
.ai/work/M1.3/review.md  ──► APPROVE ──► committer ──► PR in our fork
                                                     │
                                        partner checks (other human's session)
                                                     │
                                                     ▼  merge → main
                                        PLAN.md row updated, .ai/context.md updated
                                                     │
                                                     ▼  human says "release"
                                        npm run deploy → live URL
```

Notice: **the reviewer never sees the coder's reasoning.** That is the design — it is why the
reviewer's context packet (`CX-3`) in `steps.txt` explicitly excludes it.

---

## 5. Practical habits for a beginner

1. **Check files, not chat.** After an agent session, open `.ai/work/<STEP>/validation.md` and
   read the actual command outputs. The project rule is explicit: *"Do not claim hosted
   acceptance from a local green test."*
2. **One session, one job.** Do not ask one agent to plan *and* code *and* review. Fresh
   sessions are the mechanism that makes review independent.
3. **Look at the diff before approving.** `git diff main...<branch>` is the exact thing the
   reviewer judges. You can read it too.
4. **A human authorises, the committer session merges.** Never let an agent merge on its own
   initiative: the committer merges only after you accepted the PR.
5. **Two humans, two clones.** If you and Niklas share one checkout and one starts a branch
   while the other is on `main`, you will fight over files. Clone twice.
6. **Private stuff stays out of git.** Connection details go in `.workshop.local.md`
   (git-ignored). Never commit keys, URLs containing your team number, or `.env`.

---

## 6. Where to look first when you return

| You want to know… | Open |
|---|---|
| What we are building right now | `.ai/context.md` |
| Which steps exist and their state | `PLAN.md` |
| Who does what, and with which context | `steps.txt` |
| What the last session decided | `.ai/sessions/` (newest file) |
| What the last agent actually ran | `.ai/work/<STEP>/validation.md` |
| Why a change was approved | `.ai/work/<STEP>/review.md` |
| The rules you must not break | `AGENTS.md` and `.ai/rules.md` |
