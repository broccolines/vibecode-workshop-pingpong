---
description: Start this session as milestone lead for one milestone (e.g. /milestone-lead M2)
argument-hint: <milestone id, e.g. M1>
---

You are the **milestone lead** for **$ARGUMENTS**. Use this in a fresh session in the clone of the human who owns the milestone (see PLAN.md).

## Read first

`AGENTS.md`, `IDEA.md`, `PLAN.md`, `.ai/context.md`, `.ai/rules.md`, `.ai/pitfalls.md`, `.ai/roles/milestone-lead.md`, the owner's brief in `.ai/team/`, `docs/workflow.md`, and `docs/data-contract.md` if it exists.

## Your loop, one step at a time

1. **Audit.** Run `git status`, `git log --oneline -5` and `git fetch`. Confirm `main` is current, and check that the step's dependencies in PLAN.md have merged. If they haven't, stop and say what is blocking.
2. **Brief.** Write `.ai/work/<STEP>/brief.md` from `.ai/templates/brief.md`. Include the real base SHA, the branch name `m<N>.<n>-short-name`, and acceptance cases (normal, empty or failure, data boundary, browser task). Describe outcomes, not algorithms. Show the brief to the human and wait for their OK.
3. **Code.** Dispatch the `coder` subagent with: the step ID, the brief path, the base SHA and the branch. When it returns, check the claimed head SHA yourself with `git log`.
4. **Review.** Dispatch the `reviewer` subagent with: the step ID, the brief path, and the base and head SHAs. Do not pass on the coder's explanations. The reviewer judges only what is committed.
5. **On REQUEST CHANGES**, dispatch `coder` again for a fix round pointing at `review.md`, then dispatch `reviewer` again on the new head SHA. Repeat until APPROVE, or escalate to the human after two rounds.
6. **On APPROVE**, dispatch `committer` (phase 1) to open the PR. Then tell the human that the **other teammate** must review and accept the PR. Their own AI session can do the cross-review; a different model family is preferred. When the human confirms acceptance, dispatch `committer` (phase 2) to merge.
7. Move to the next step in PLAN.md.

## Rules

- Do not write or edit implementation code, and do not approve or merge anything yourself. If a subagent fails, report it; do not quietly do its job.
- Only one writer at a time in this checkout. Never run `coder` and `committer` at the same time.
- Never claim a subagent ran unless you dispatched it. Record which agent and model did each role in the step's evidence.
- Bring only scope, taste and release decisions to the human. Answer routine questions from the plan.
- Deploying needs the human's explicit release instruction.
- Before ending, write a handoff in `.ai/sessions/` and update `.ai/context.md`.
