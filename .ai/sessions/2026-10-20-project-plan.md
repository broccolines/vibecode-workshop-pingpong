# Session — 2026-10-20 project plan (project lead)

## Decisions

- Idea: a 42 Heilbronn table-tennis hub. Niklas owns the ladder track (Elo, ranked queue, tournaments). Eric owns the fun track (casual invites, merry-go-round, other fun modes).
- M1 is a joint foundation: live URL, an agreed player and match format, and a first recorded match that survives a restart. Both tracks depend on it.
- Niklas decided: real table tennis in person; simple player name for the demo with a stable player ID so 42 intra login can be added later (M5.1); Elo starts at 1000 with K-factor 32; M2 and M3 run in parallel with cross-review.
- Agents set up for Claude Code: `/project-lead` and `/milestone-lead <ID>` slash commands, plus `coder` (Sonnet), `reviewer` (Opus) and `committer` subagents in `.claude/`. The milestone lead dispatches the subagents. The other teammate's session gives the partner check on each PR. See docs/agents.md.
- Still open for Eric: confirm that "invite" means inside our app, not 42 intra.

## Handoff

State: IDEA.md, PLAN.md, .ai/team/*.md, .claude/agents, .claude/commands, docs/agents.md and .ai/context.md are written on branch `plan-ladder-and-team-briefs`, uncommitted.
Next step: commit the plan and open the PR in our fork. Eric pulls it and confirms. Then the M1 milestone lead is assigned.
Half-done work: none.
Branch / reviewed SHA / PR: `plan-ladder-and-team-briefs`, no commit, no PR.
Checks and limitations: documentation only, no code changed, no tests run.
