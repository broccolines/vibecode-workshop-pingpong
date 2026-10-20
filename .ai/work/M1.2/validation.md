# M1.2 validation

- Base SHA: 82ebb237da32c2910fc55fb960a301cd7a92b455
- Reviewed head (round 1): 2739aff72a2b2b7572a953a4fd697d4ce66c2f06
- Head SHA after fix round 1: the commit that contains this file (`git log -1 --format=%H` on branch m1.2-data-contract); it cannot name itself, so the coder handback and review record it.
- Changed: docs/data-contract.md and this file. No code changed.

## Fix round 1

- F1: declined invite stored vs eric.md is now open question Q10 (for Eric), with the current default stated; example 8.2 points to it.
- F2: cancel row reworded; cancel authority is in section 3, and ranked matches (server-created) are cancelled by either participant.
- F3: partial result allowed for running multi-player rounds; partly played rounds can be cancelled by the starter; each elimination updates `updatedAt`.
- F4: decided by Niklas 2026-10-20 (Q11): ranked matches are created only by the server (queue or tournament). Tables and failure cases updated.
- Info: `schemaVersion` is per record; head SHA recorded as above.
- Decisions recorded (Niklas, 2026-10-20): Q1 unique names (renaming stays open), Q4 non-reporter confirms (tables and example updated), Q6 tournament matches are ranked, Q8 score is games won.

## Checks run

- `npm test` on macOS (darwin): 21 tests, 20 pass, 1 fail (deploy lock, "flock is missing"; expected on macOS, unrelated to docs).
- Manual read of docs/data-contract.md for consistency of tables, failure cases and examples with the decisions.

## Not done

- No browser check: no UI changed.
- Not run on Linux. Independent re-review is the reviewer's step.

## Known limitations

- Open: Q1 (rename), Q2, Q3, Q5, Q7, Q9, Q10.
- Elo formula is deferred to M2.1; only the 1016/984 check is fixed.
