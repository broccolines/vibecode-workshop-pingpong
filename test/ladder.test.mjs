import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import http from 'node:http';
import { createApp, isInsideDir } from '../server.mjs';
import { MAX_SCORE } from '../lib/ladder.mjs';
import { Store } from '../lib/store.mjs';

async function start(t, dir) {
  dir ??= await mkdtemp(join(tmpdir(), 'ladder-'));
  const store = await Store.open(dir);
  const app = createApp({ revision: 'test', store });
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => { app.close(resolve); app.closeAllConnections(); }));
  const origin = `http://127.0.0.1:${app.address().port}`;
  const post = (path, body, headers = { 'content-type': 'application/json' }) =>
    fetch(origin + path, { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });
  const get = async path => (await fetch(origin + path)).json();
  return { dir, origin, post, get };
}
const player = async (c, name) => (await c.post('/api/players', { name })).json();
const match = (c, acting, a, b, sa, sb) => c.post('/api/matches', {
  actingPlayerId: acting, participants: [a, b], result: { scores: { [a]: sa, [b]: sb } },
});
async function snapshot(c) {
  return JSON.stringify([await c.get('/api/players'), await c.get('/api/matches')]);
}
// Takes the snapshot BEFORE the request, so "nothing changed" can really fail.
async function rejected(c, send, status, label = '') {
  const before = await snapshot(c);
  const response = await send();
  assert.equal(response.status, status, label);
  const body = await response.json();
  assert.equal(typeof body.error, 'string', label);
  assert.ok(body.error.length > 0, label);
  assert.equal(await snapshot(c), before, `${label}: store changed`);
}

test('empty store, then Anna 2-1 Ben is recorded with contract-shaped records', async t => {
  const c = await start(t);
  assert.deepEqual(await c.get('/api/players'), []);
  assert.deepEqual(await c.get('/api/matches'), []);
  const anna = await player(c, 'Anna'), ben = await player(c, 'Ben');
  for (const p of [anna, ben]) {
    assert.match(p.id, /^p_[0-9a-f]+$/);
    assert.equal(p.schemaVersion, 1);
    assert.equal(p.externalLogin, null);
    assert.equal(new Date(p.createdAt).toISOString(), p.createdAt);
  }
  const response = await match(c, anna.id, anna.id, ben.id, 2, 1);
  assert.equal(response.status, 201);
  const m = await response.json();
  assert.match(m.id, /^m_[0-9a-f]+$/);
  assert.deepEqual(
    { ...m, id: undefined, createdAt: undefined, updatedAt: undefined, reportedAt: undefined, confirmedAt: undefined },
    { schemaVersion: 1, id: undefined, mode: 'casual', state: 'confirmed', participants: [anna.id, ben.id], createdBy: anna.id,
      result: { scores: { [anna.id]: 2, [ben.id]: 1 } }, reportedBy: anna.id, decidedBy: null, details: {},
      createdAt: undefined, updatedAt: undefined, reportedAt: undefined, confirmedAt: undefined });
  for (const k of ['createdAt', 'updatedAt', 'reportedAt', 'confirmedAt']) assert.equal(new Date(m[k]).toISOString(), m[k]);
  assert.deepEqual(await c.get('/api/matches'), [m]);
});

test('players and matches survive a restart with the same DATA_DIR; unknown fields are preserved', async t => {
  const first = await start(t);
  const anna = await player(first, 'Anna'), ben = await player(first, 'Ben');
  const m = await (await match(first, ben.id, anna.id, ben.id, 0, 3)).json();
  // simulate a newer version having added fields to a stored record
  const file = join(first.dir, 'store.json');
  const doc = JSON.parse(await readFile(file, 'utf8'));
  doc.players[0].futureField = { x: 1 };
  doc.matches[0].details.mode_extra = 'keep';
  await writeFile(file, JSON.stringify(doc));
  const second = await start(t, first.dir);
  assert.equal((await second.get('/api/players')).length, 2);
  assert.deepEqual((await second.get('/api/matches'))[0].id, m.id);
  await player(second, 'Cem'); // rewrites the store
  const after = JSON.parse(await readFile(file, 'utf8'));
  assert.deepEqual(after.players[0].futureField, { x: 1 });
  assert.equal(after.matches[0].details.mode_extra, 'keep');
  assert.equal(after.players.length, 3);
});

test('player name validation and duplicates are rejected without storing anything', async t => {
  const c = await start(t);
  await player(c, 'Anna');
  const cases = [
    [' anna ', 409], ['ANNA', 409], ['A   nna', 201], ['', 400], ['   ', 400], ['x'.repeat(31), 400],
    ['bad\u0007name', 400], [42, 400], [null, 400],
  ];
  for (const [name, status] of cases) {
    if (status === 201) { assert.equal((await c.post('/api/players', { name })).status, 201); continue; }
    const before = JSON.stringify(await c.get('/api/players'));
    const response = await c.post('/api/players', { name });
    assert.equal(response.status, status, JSON.stringify(name));
    assert.ok((await response.json()).error);
    assert.equal(JSON.stringify(await c.get('/api/players')), before);
  }
  assert.equal((await c.post('/api/players', { name: 'x'.repeat(30) })).status, 201);
  assert.equal((await c.post('/api/players', 'not json')).status, 400);
  assert.equal((await c.post('/api/players', { name: 'Zed' }, { 'content-type': 'text/plain' })).status, 415);
  assert.equal((await c.post('/api/players', JSON.stringify({ name: 'y'.repeat(20000) }))).status, 413);
  assert.deepEqual((await c.get('/api/players')).map(p => p.name), ['Anna', 'A nna', 'x'.repeat(30)]);
});

test('invalid matches are rejected with a message and change nothing', async t => {
  const c = await start(t);
  const anna = await player(c, 'Anna'), ben = await player(c, 'Ben'), cem = await player(c, 'Cem');
  const A = anna.id, B = ben.id;
  const scores = (a, b) => ({ [A]: a, [B]: b });
  const base = { actingPlayerId: A, participants: [A, B], result: { scores: scores(2, 1) } };
  const attempts = [
    ['unknown opponent', { ...base, participants: [A, 'p_nope'], result: { scores: { [A]: 2, p_nope: 1 } } }, 404],
    ['same player twice', { ...base, participants: [A, A], result: { scores: { [A]: 2 } } }, 400],
    ['equal scores', { ...base, result: { scores: scores(1, 1) } }, 400],
    ['missing score', { ...base, result: { scores: { [A]: 2 } } }, 400],
    ['no result', { ...base, result: undefined }, 400],
    ['negative score', { ...base, result: { scores: scores(-1, 2) } }, 400],
    ['fractional score', { ...base, result: { scores: scores(2.5, 1) } }, 400],
    ['huge score', { ...base, result: { scores: scores(1e300, 1) } }, 400],
    ['unsafe integer score', { ...base, result: { scores: scores(2 ** 53, 1) } }, 400],
    ['score above the cap', { ...base, result: { scores: scores(MAX_SCORE + 1, 1) } }, 400],
    ['Infinity (1e999 in JSON text)', null, 400],
    ['string score', { ...base, result: { scores: scores('2', 1) } }, 400],
    ['null score', { ...base, result: { scores: scores(null, 1) } }, 400],
    ['score for a third player', { ...base, result: { scores: { [A]: 2, [B]: 1, [cem.id]: 0 } } }, 400],
    ['scores for other players', { ...base, result: { scores: { [A]: 2, [cem.id]: 1 } } }, 400],
    ['three participants', { ...base, participants: [A, B, cem.id] }, 400],
    ['one participant', { ...base, participants: [A] }, 400],
    ['missing acting player', { ...base, actingPlayerId: undefined }, 400],
    ['nonexistent acting player', { ...base, actingPlayerId: 'p_ghost' }, 403],
    ['acting player not a participant', { ...base, actingPlayerId: cem.id }, 403],
    ['ranked from a client', { ...base, mode: 'ranked' }, 403],
    ['unknown mode', { ...base, mode: 'chess' }, 400],
    ['merry-go-round not recordable here', { ...base, mode: 'merry-go-round' }, 400],
  ];
  for (const [label, body, status] of attempts) {
    await rejected(c, () => c.post('/api/matches', body ?? JSON.stringify(base).replace(/:2\b/, ':1e999')), status, label);
  }
  assert.deepEqual(await c.get('/api/matches'), []);
  assert.equal((await c.post('/api/matches', base)).status, 201);
  // the cap itself is accepted
  assert.equal((await c.post('/api/matches', { ...base, result: { scores: scores(MAX_SCORE, 0) } })).status, 201);
});

test('DATA_DIR guard: inside the repo is refused, sibling names starting with ".." are not', () => {
  const root = '/srv/app/';
  assert.equal(isInsideDir(root, '/srv/app'), true);
  assert.equal(isInsideDir(root, '/srv/app/data'), true);
  assert.equal(isInsideDir(root, '/srv/app/..x'), true);
  assert.equal(isInsideDir(root, '/srv/app/..x/store'), true);
  assert.equal(isInsideDir(root, '/srv/data'), false);
  assert.equal(isInsideDir(root, '/srv/app-data'), false);
  assert.equal(isInsideDir(root, '/srv'), false);
  assert.equal(isInsideDir('/srv/app/', '/srv/..x'), false);
  assert.equal(isInsideDir('/srv/', '/srv/..x'), true);
});

test('concurrent writes: different names both survive, identical names leave exactly one', async t => {
  const c = await start(t);
  const names = Array.from({ length: 20 }, (_, i) => `Player ${i}`);
  const results = await Promise.all(names.map(name => c.post('/api/players', { name })));
  assert.ok(results.every(r => r.status === 201));
  assert.equal((await c.get('/api/players')).length, 20);

  const same = await Promise.all(Array.from({ length: 10 }, (_, i) => c.post('/api/players', { name: i % 2 ? 'Dup' : ' dup ' })));
  assert.deepEqual(same.map(r => r.status).sort(), [201, ...Array(9).fill(409)]);
  assert.equal((await c.get('/api/players')).filter(p => p.name.toLowerCase() === 'dup').length, 1);

  const [a, b] = await c.get('/api/players');
  const matches = await Promise.all(Array.from({ length: 10 }, (_, i) => match(c, a.id, a.id, b.id, i + 1, 0)));
  assert.ok(matches.every(r => r.status === 201));
  const stored = await c.get('/api/matches');
  assert.equal(stored.length, 10);
  assert.equal(new Set(stored.map(m => m.id)).size, 10);
  // the file on disk is complete and parseable, with no temp files left behind
  const doc = JSON.parse(await readFile(join(c.dir, 'store.json'), 'utf8'));
  assert.equal(doc.players.length, 21);
  assert.equal(doc.matches.length, 10);
  assert.deepEqual((await readdir(c.dir)).sort(), ['store.json']);
});

test('a failed write leaves memory and disk on the previous state', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'ladder-'));
  const store = await Store.open(dir);
  await store.update((p, m) => ({ players: [{ id: 'p_1', name: 'A' }], matches: m, result: null }));
  // a result that cannot be serialised makes the write fail after validation
  const circular = {}; circular.self = circular;
  await assert.rejects(store.update((p, m) => ({ players: [...p, circular], matches: m, result: null })));
  assert.deepEqual(store.players, [{ id: 'p_1', name: 'A' }]);
  const reopened = await Store.open(dir);
  assert.deepEqual(reopened.players, [{ id: 'p_1', name: 'A' }]);
  // the queue keeps working after a failure
  await store.update((p, m) => ({ players: [...p, { id: 'p_2' }], matches: m, result: null }));
  assert.equal(store.players.length, 2);
});

test('a stale temp file from a crash is ignored and a corrupt store fails visibly', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'ladder-'));
  const store = await Store.open(dir);
  await store.update((p, m) => ({ players: [{ id: 'p_1', name: 'A' }], matches: m, result: null }));
  await writeFile(join(dir, 'store.json.deadbeef.tmp'), '{"players": [');
  const reopened = await Store.open(dir);
  assert.equal(reopened.players.length, 1);
  assert.deepEqual(await readdir(dir), ['store.json']);
  await writeFile(join(dir, 'store.json'), '{"players": [');
  await assert.rejects(Store.open(dir), /unreadable/);
});

test('unwritable data location fails visibly', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ladder-'));
  await writeFile(join(dir, 'file'), 'x');
  await assert.rejects(Store.open(join(dir, 'file', 'sub')));
});

test('data boundary: store is not served, repo files stay 404, data is outside the repo', async t => {
  const c = await start(t);
  await player(c, 'Anna');
  for (const path of ['/store.json', '/data/store.json', '/api/store.json', '/lib/store.mjs', '/lib/ladder.mjs', '/server.mjs', '/package.json',
    '/.env', '/.git/config', '/%2e%2e/store.json', '/public/../server.mjs', '/api/unknown', '/api/../server.mjs', '/api/%2e%2e/package.json']) {
    const response = await fetch(c.origin + path);
    assert.equal(response.status, 404, path);
    assert.ok(!(await response.text()).includes('Anna'), path);
  }
  // raw request lines, sent without any client-side normalisation of ".."
  const raw = path => new Promise((resolve, reject) => {
    const { port } = new URL(c.origin);
    http.get({ host: '127.0.0.1', port, path }, res => {
      let text = ''; res.on('data', d => { text += d; }); res.on('end', () => resolve({ status: res.statusCode, text }));
    }).on('error', reject);
  });
  for (const path of ['/../store.json', '/../server.mjs', '/public/../server.mjs', '/api/../package.json', '/api/players/../../server.mjs',
    '/%2e%2e/server.mjs', '/..%2fserver.mjs', '/public/%2e%2e/lib/store.mjs', '/public/..\\server.mjs', '//etc/passwd']) {
    const r = await raw(path);
    assert.equal(r.status, 404, path);
    assert.ok(!r.text.includes('Anna') && !r.text.includes('createServer'), path);
  }
  const repo = new URL('..', import.meta.url).pathname;
  assert.ok(!c.dir.startsWith(repo));
  assert.equal((await fetch(c.origin + '/api/players', { method: 'DELETE' })).status, 405);
});
