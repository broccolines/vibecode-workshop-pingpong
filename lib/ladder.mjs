import { randomBytes } from 'node:crypto';
import { SCHEMA_VERSION } from './store.mjs';

export class RejectedError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

const newId = (prefix, taken) => {
  let id;
  do { id = `${prefix}_${randomBytes(6).toString('hex')}`; } while (taken.has(id));
  return id;
};

export function cleanName(raw) {
  if (typeof raw !== 'string') throw new RejectedError('Name is required.');
  const name = raw.trim().replace(/\s+/g, ' ');
  if (!name) throw new RejectedError('Name cannot be empty.');
  if (/\p{Cc}/u.test(name)) throw new RejectedError('Name cannot contain control characters.');
  if ([...name].length > 30) throw new RejectedError('Name must be 30 characters or fewer.');
  return name;
}
const nameKey = name => name.toLowerCase();

export function createPlayer(store, rawName) {
  const name = cleanName(rawName);
  return store.update((players, matches) => {
    if (players.some(p => nameKey(p.name) === nameKey(name))) {
      throw new RejectedError(`The name "${name}" is already taken.`, 409);
    }
    const player = {
      schemaVersion: SCHEMA_VERSION,
      id: newId('p', new Set(players.map(p => p.id))),
      name, externalLogin: null, createdAt: new Date().toISOString(),
    };
    return { players: [...players, player], matches, result: player };
  });
}

// M1.3 shortcut: an already-played casual 1v1 is stored directly as `confirmed`
// (contract section 2: casual report and confirm happen at the same moment).
// Scores are games won in a best-of match, so small numbers are enough; 99 leaves ample room and keeps the list readable.
export const MAX_SCORE = 99;

export function recordMatch(store, body) {
  const { mode = 'casual', actingPlayerId, participants, result } = body ?? {};
  if (mode === 'ranked') throw new RejectedError('Ranked matches are created by the server only.', 403);
  if (mode !== 'casual') throw new RejectedError(`Mode "${String(mode)}" cannot be recorded.`);
  if (typeof actingPlayerId !== 'string') throw new RejectedError('Say who you are (actingPlayerId).');
  if (!Array.isArray(participants) || participants.length !== 2 || participants.some(id => typeof id !== 'string')) {
    throw new RejectedError('A match needs exactly 2 players.');
  }
  if (participants[0] === participants[1]) throw new RejectedError('A player cannot play against themselves.');
  const scores = result?.scores;
  if (!scores || typeof scores !== 'object' || Array.isArray(scores)) throw new RejectedError('Scores are required.');
  const keys = Object.keys(scores);
  if (keys.length !== 2 || !participants.every(id => Object.hasOwn(scores, id))) {
    throw new RejectedError('Give exactly one score for each player in the match.');
  }
  for (const id of participants) {
    const s = scores[id];
    if (!Number.isSafeInteger(s) || s < 0 || s > MAX_SCORE) throw new RejectedError(`Scores must be whole numbers from 0 to ${MAX_SCORE}.`);
  }
  if (scores[participants[0]] === scores[participants[1]]) throw new RejectedError('Scores cannot be equal: someone has to win.');

  return store.update((players, matches) => {
    const ids = new Set(players.map(p => p.id));
    if (!ids.has(actingPlayerId)) throw new RejectedError('The acting player does not exist.', 403);
    for (const id of participants) if (!ids.has(id)) throw new RejectedError('A player in this match does not exist.', 404);
    if (!participants.includes(actingPlayerId)) throw new RejectedError('You can only record matches you played in.', 403);
    const now = new Date().toISOString();
    const match = {
      schemaVersion: SCHEMA_VERSION,
      id: newId('m', new Set(matches.map(m => m.id))),
      mode: 'casual', state: 'confirmed', participants: [...participants],
      createdBy: actingPlayerId,
      result: { scores: Object.fromEntries(participants.map(id => [id, scores[id]])) },
      reportedBy: actingPlayerId, decidedBy: null, details: {},
      createdAt: now, updatedAt: now, reportedAt: now, confirmedAt: now,
    };
    return { players, matches: [...matches, match], result: match };
  });
}
