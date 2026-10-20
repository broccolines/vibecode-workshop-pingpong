# M1.2 validation

- Base SHA: 82ebb237da32c2910fc55fb960a301cd7a92b455
- Head SHA: see the final commit on branch m1.2-data-contract (git log -1); this file is committed together with the document, so the SHA is reported in the coder handback.
- Changed: docs/data-contract.md (new) and this file. No code changed.

## Checks run

- `npm test` on macOS (darwin): 21 tests, 20 pass, 1 fail. The failure is "deploy lock rejects a second holder and releases when the holder dies": "Cannot lock deploy because flock is missing". Expected on macOS (no flock); unrelated to this documentation-only change. Not re-run on Linux.
- Manual read of docs/data-contract.md against each acceptance item in the brief: player (section 1), match and states (2), authority and honour-system statement (3), ownership and derived Elo (4, 5), storage (6), failure cases (7), three worked examples (8), open questions (9).

## Not done

- No browser check: no UI changed.
- No independent review yet; that is the reviewer's step.

## Known limitations

- Defaults chosen in the document (unique names, casual results final without confirmation, loser confirms own reported loss, DATA_DIR name, games-won score) are listed as open questions Q1-Q9 for the humans.
- Elo formula is deferred to M2.1; only the 1016/984 check is fixed.
