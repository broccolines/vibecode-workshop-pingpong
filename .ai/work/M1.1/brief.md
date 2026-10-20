# M1.1 — The live starting point

## Outcome

Both humans can reach our team's app at the assigned HTTPS URL, on a laptop and on a phone. `/api/health` reports the exact `main` revision we chose to deploy. This proves the deploy path works before any feature code exists.

## Audit

- Base: `main` at `82ebb237da32c2910fc55fb960a301cd7a92b455` ("created plan"), in sync with `origin/main` (`broccolines/vibecode-workshop-pingpong`), clean tree, checked 2026-10-20.
- App: still the unmodified starter. `server.mjs` serves `public/index.html`, `public/style.css` and `GET /api/health` → `{"ok":true,"revision":APP_REVISION}`. Deployment helpers are `scripts/deploy.mjs` and `scripts/smoke.mjs`, documented in docs/connect.md and docs/deploy.md.
- CI: `.github/workflows/check.yml` exists. No run on our fork has been confirmed yet.
- Niklas's Mac: Node was installed before the laptop smoke run, so `npm test` and
  `npm run smoke` could run there. **The exact Node version on that Mac is not recorded in
  this evidence** — a gap in the record, not a claim of correctness. `gh` is still not
  installed on that Mac, so the committer there cannot open PRs with the CLI.
- The smoke and the 20/21 local test run were performed on **Niklas's Mac**, not on the
  guest. The guest is the deployment target and its `npm test` passed 21/21.
- Known to the lead and deliberately excluded from this repository: the team number, the SSH
  port, the host and the assigned URL from the organiser handout. These are connection details
  and must stay out of commits. Keep them in `.workshop.local.md`, which Git ignores. Every URL
  in the evidence is written as `<assigned URL>`.

## Acceptance

- [ ] Normal case: from the guest shell as `vc-team`, `npm test` passes in `~/src/team` at the chosen `main` SHA, and `npm run deploy` releases it. From a laptop, `npm run smoke -- <assigned URL>` passes, and `<URL>/api/health` returns `{"ok":true,"revision":"<that SHA>"}`.
- [ ] Failure case: if the SSH connection, the deploy or smoke fails, the exact error and the next action (fix, or ask the organiser) are recorded. A placeholder page or a URL that loads is not a pass unless the revision matches.
- [ ] Access boundary: both humans can push to `broccolines/vibecode-workshop-pingpong` and see a `Check` run on GitHub. Each human connects with their own key; nobody copies private keys between laptops. No host, port, key or token appears in the repo.
- [ ] Browser task: the other teammate (Eric) opens the URL on a phone and confirms it loads. Record the device, the time and what he saw.

## Boundaries and dependencies

- Depends on the organiser's team handout and the GitHub fork access. Nothing in PLAN.md has to merge first.
- No app behaviour changes are expected. If a code or config change turns out to be needed to deploy, it goes on branch `m1.1-live-url` through coder → reviewer → committer like any other step.
- Deploying needs Niklas's explicit release instruction. The deploy runs on the guest, never on a laptop.
- Out of scope: any ping-pong feature, page redesign or data storage (M1.2/M1.3).

## Handoff

- Human owner: Niklas. Phone check: Eric.
- Branch: `m1.1-live-url`, used for the evidence PR and for any fix that turns out to be needed.
- Coder: `coder` subagent (Sonnet), only if a change is needed. Reviewer: `reviewer` subagent (Opus) checks the recorded evidence and any diff. Committer: `committer` subagent.
- Evidence: `.ai/work/M1.1/validation.md` (deploy and smoke output with private details removed, health JSON, phone check) and `.ai/work/M1.1/review.md`.
