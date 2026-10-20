import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { relative, isAbsolute, sep } from 'node:path';
import { Store, defaultDataDir } from './lib/store.mjs';
import { createPlayer, recordMatch, RejectedError } from './lib/ladder.mjs';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
]);

const MAX_BODY = 8 * 1024;

function sendJson(req, res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify(data));
}

async function readJson(req) {
  if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) throw new RejectedError('Send JSON (content-type application/json).', 415);
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new RejectedError('Request too large.', 413);
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new RejectedError('Request body is not valid JSON.'); }
}

async function api(req, res, path, store) {
  if (!store) return sendJson(req, res, 503, { error: 'Data store unavailable.' });
  const routes = {
    '/api/players': { GET: () => store.players, POST: async () => createPlayer(store, (await readJson(req))?.name) },
    '/api/matches': { GET: () => store.matches, POST: async () => recordMatch(store, await readJson(req)) },
  };
  const route = routes[path];
  if (!route) return sendJson(req, res, 404, { error: 'Not found' });
  const method = req.method === 'HEAD' ? 'GET' : req.method;
  if (!route[method]) { res.setHeader('allow', 'GET, HEAD, POST'); return sendJson(req, res, 405, { error: 'Method not allowed' }); }
  try {
    const data = await route[method]();
    sendJson(req, res, method === 'POST' ? 201 : 200, data);
  } catch (error) {
    if (error instanceof RejectedError) return sendJson(req, res, error.status, { error: error.message });
    console.error('Request failed:', error);
    sendJson(req, res, 500, { error: 'Something went wrong; nothing was saved.' });
  }
}

export function createApp({ revision = process.env.APP_REVISION || 'development', store = null } = {}) {
  return http.createServer(async (req, res) => {
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('cache-control', 'no-store');
    let path;
    try { path = new URL(req.url, 'http://localhost').pathname; }
    catch { res.writeHead(400); return res.end('Bad request'); }
    if (path.startsWith('/api/') && path !== '/api/health') return api(req, res, path, store);
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { allow: 'GET, HEAD' });
      return res.end('Method not allowed');
    }
    if (path === '/api/health') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ ok: true, revision }));
    }
    const asset = assets.get(path);
    if (!asset) { res.writeHead(404); return res.end('Not found'); }
    try {
      const body = await readFile(new URL(`./public/${asset[0]}`, import.meta.url));
      res.writeHead(200, { 'content-type': asset[1] });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch (error) {
      console.error('Asset unavailable:', error.message);
      res.writeHead(500);
      res.end('Page temporarily unavailable');
    }
  });
}

export function isInsideDir(root, dir) {
  const rel = relative(root, dir);
  return rel === '' || (rel !== '..' && !rel.startsWith('..' + sep) && !isAbsolute(rel));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '0.0.0.0';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1–65535');
  const root = fileURLToPath(new URL('.', import.meta.url));
  const dir = defaultDataDir();
  if (isInsideDir(root, dir)) throw new Error(`DATA_DIR ${dir} must be outside the app directory`);
  const store = await Store.open(dir);
  console.log(`Data directory: ${store.dir}`);
  const app = createApp({ store });
  app.on('error', error => { console.error(error.message); process.exitCode = 1; });
  app.listen(port, host, () => console.log(`Workshop app listening on ${host}:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      app.close(() => process.exit(0));
      app.closeIdleConnections();
    });
  }
}
