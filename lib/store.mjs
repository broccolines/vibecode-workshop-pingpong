import { mkdir, open, readFile, readdir, rename, unlink } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export const SCHEMA_VERSION = 1;
const FILE = 'store.json';

export function defaultDataDir(env = process.env) {
  return resolve(env.DATA_DIR || join(homedir(), '.local/share/vibecode-workshop/data'));
}

// One JSON document, kept in memory and rewritten atomically on every change.
// Writes are serialised through a promise chain, so concurrent requests never
// interleave, and a failed write leaves memory and disk on the previous state.
export class Store {
  #dir; #doc; #queue = Promise.resolve();

  static async open(dir = defaultDataDir()) {
    dir = resolve(dir);
    await mkdir(dir, { recursive: true });
    for (const name of await readdir(dir)) {
      if (name.startsWith(`${FILE}.`) && name.endsWith('.tmp')) await unlink(join(dir, name)).catch(() => {});
    }
    let doc;
    try { doc = JSON.parse(await readFile(join(dir, FILE), 'utf8')); }
    catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Data store ${join(dir, FILE)} is unreadable: ${error.message}`);
      doc = { schemaVersion: SCHEMA_VERSION, players: [], matches: [] };
    }
    if (!doc || !Array.isArray(doc.players) || !Array.isArray(doc.matches)) {
      throw new Error(`Data store ${join(dir, FILE)} has an unexpected shape`);
    }
    const store = new Store(dir, doc);
    await store.#write(doc); // fails visibly now if the directory is not writable
    return store;
  }

  constructor(dir, doc) { this.#dir = dir; this.#doc = doc; }

  get dir() { return this.#dir; }
  get players() { return structuredClone(this.#doc.players); }
  get matches() { return structuredClone(this.#doc.matches); }

  // fn(players, matches) returns { players, matches, result }; it may throw to reject.
  // Nothing is changed unless the new document is durably written.
  update(fn) {
    const run = this.#queue.then(async () => {
      const out = fn(structuredClone(this.#doc.players), structuredClone(this.#doc.matches));
      const next = { ...this.#doc, schemaVersion: SCHEMA_VERSION, players: out.players, matches: out.matches };
      await this.#write(next);
      this.#doc = next;
      return structuredClone(out.result);
    });
    this.#queue = run.catch(() => {});
    return run;
  }

  // Write a temp file in the same directory, fsync it, rename over the store (atomic),
  // then fsync the directory. A crash leaves either the old or the new file.
  async #write(doc) {
    const tmp = join(this.#dir, `${FILE}.${randomBytes(6).toString('hex')}.tmp`);
    const handle = await open(tmp, 'w', 0o600);
    try {
      await handle.writeFile(JSON.stringify(doc, null, 2));
      await handle.sync();
    } catch (error) {
      await handle.close().catch(() => {});
      await unlink(tmp).catch(() => {});
      throw error;
    }
    await handle.close();
    try { await rename(tmp, join(this.#dir, FILE)); }
    catch (error) { await unlink(tmp).catch(() => {}); throw error; }
    const dirHandle = await open(this.#dir, 'r').catch(() => null);
    if (dirHandle) { await dirHandle.sync().catch(() => {}); await dirHandle.close(); }
  }
}
