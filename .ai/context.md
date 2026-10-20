# Current focus

M1 milestone lead active (Niklas's clone). M1.1: main `82ebb23` deployed from our fork to the
assigned HTTPS URL on 2026-10-20 and public smoke passes. The step evidence is on branch
`m1.1-live-url` (history rewritten before merge, so the assigned URL never enters `main`).

Open for M1.1:

- [ ] Eric's phone check of the assigned URL.
- [ ] Eric confirming his push access to the fork.
- [ ] Eric's own personal SSH public key added to the guest's `~/.ssh/authorized_keys`, and a
      connection with it. The deploy used the shared bootstrap team key from the handout.
- [ ] GitHub Actions enabled for the fork — the workflow is active, but no run has been
      produced for any push or pull request yet.
- [ ] The Node version used on Niklas's Mac for the laptop smoke is not recorded; Niklas to
      add it.
- [ ] No browser page check by the M1 lead. The page is still the unchanged starter page.
- [ ] Niklas's local clone of `m1.1-live-url` needs to be realigned after the history
      rewrite: `git fetch origin && git reset --hard origin/m1.1-live-url`.

Next step: M1.2 shared data contract.
