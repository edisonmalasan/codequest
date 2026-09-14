import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { SimulationLedger, snapshotFrom } from '../src/mock.ts';
import { quest, recordFixture } from '../src/fixtures.ts';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const offlineControls = new Map([
  ['/__offline-control/', new URL('./fixtures/offline-control.html', import.meta.url)],
  ['/__offline-control/sw.js', new URL('./fixtures/offline-control-worker.js', import.meta.url)],
]);
let ledger = new SimulationLedger();
const records = [];
let revision = 1;
let incompatibleLesson = false;
let appOutage = false;
const workerPolicy = "default-src 'none'; script-src 'unsafe-eval'; connect-src 'none'; worker-src 'none'";
const bootstrapPolicy = "default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'self'; frame-src 'none'; form-action 'none'; base-uri 'none'";
const runnerPublicPaths = new Set(['/bootstrap.html', '/bootstrap.js', '/worker.js', '/runner-sw.js', '/runner-prepare.html', '/runner-prepare.js', '/preview.html', '/preview.js']);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const servers = [];

for (const [host, port, role] of [['127.0.0.1', 4310, 'app'], ['127.0.0.2', 4311, 'runner'], ['127.0.0.1', 4312, 'sink']]) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://${host}:${port}`);
      res.setHeader('Cache-Control', 'no-store');
      if (role === 'runner' && (req.method !== 'GET' || url.search || !runnerPublicPaths.has(url.pathname))) { res.writeHead(404); res.end('Runner public resource unavailable'); return; }
      if (role === 'sink') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        if (url.pathname === '/records') { res.end(JSON.stringify(records)); return; }
        if (url.pathname === '/reset' && req.method === 'POST') { records.length = 0; res.end('{}'); return; }
        if (records.length < 2000) records.push({ method: req.method, path: url.pathname, query: url.search.slice(0, 300), at: Date.now() });
        res.end('{}'); return;
      }
      if (url.pathname === '/__revision' && req.method === 'POST') { revision++; res.end(String(revision)); return; }
      if (role === 'app' && url.pathname === '/__app-outage' && req.method === 'POST') {
        appOutage = url.searchParams.get('enabled') === 'true';
        res.end('{}'); return;
      }
      if (role === 'app' && appOutage) { res.writeHead(503); res.end('Synthetic public origin outage'); return; }
      const offlineControl = role === 'app' ? offlineControls.get(url.pathname) : undefined;
      if (offlineControl) {
        res.setHeader('Content-Type', url.pathname.endsWith('.js') ? 'text/javascript' : 'text/html');
        res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'");
        res.end(await readFile(offlineControl)); return;
      }
      if (role === 'app' && url.pathname === '/__mock-reset' && req.method === 'POST') {
        ledger = new SimulationLedger();
        res.end('{}'); return;
      }
      if (url.pathname === '/__lesson-mode' && req.method === 'POST') {
        incompatibleLesson = url.searchParams.get('incompatible') === 'true';
        res.end('{}'); return;
      }
      if (url.pathname.startsWith('/__lesson/')) {
        const fixture = url.pathname === '/__lesson/Q01' ? quest : url.pathname === '/__lesson/RECORDS' ? recordFixture : undefined;
        res.setHeader('Content-Type', 'application/json');
        if (!fixture) { res.writeHead(404); res.end('{}'); return; }
        res.end(JSON.stringify({ ...fixture, contentVersion: '1', assessmentVersion: incompatibleLesson && fixture.id === 'Q01' ? '2' : '1' })); return;
      }
      if (url.pathname === '/__protected') { res.setHeader('Content-Type', 'application/json'); res.end('{"canary":"SYNTHETIC_SESSION_ONLY"}'); return; }
      if (url.pathname === '/__mock' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) { body += chunk.toString(); if (Buffer.byteLength(body) > 70000) { res.writeHead(413); res.end(); return; } }
        let input;
        try { input = snapshotFrom(JSON.parse(body)); } catch { res.writeHead(400); res.end('Malformed mock payload'); return; }
        if (!input) { res.writeHead(400); res.end('Invalid mock payload'); return; }
        const principal = typeof req.headers['x-mock-owner'] === 'string' ? req.headers['x-mock-owner'] : 'guest';
        const receipt = ledger.accept(principal, input);
        if (req.headers['x-mock-lose-response'] === '1') { req.socket.destroy(); return; }
        res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(receipt)); return;
      }
      const path = resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
      if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403); res.end(); return; }
      if (role === 'runner') res.setHeader('Content-Security-Policy', url.pathname === '/worker.js' ? workerPolicy : url.pathname === '/preview.html' ? "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; worker-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'" : bootstrapPolicy);
      if (role === 'app' && url.searchParams.get('framePolicy') === 'none') res.setHeader('Content-Security-Policy', "frame-src 'none'");
      if (role === 'app' && url.searchParams.get('framePolicy') === 'isolated') res.setHeader('Content-Security-Policy', "frame-src http://127.0.0.2:4311/bootstrap.html http://127.0.0.2:4311/runner-prepare.html http://127.0.0.2:4311/preview.html");
      res.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream');
      if (!(await stat(path)).isFile()) { res.writeHead(404); res.end(); return; }
      const bytes = await readFile(path);
      if (role === 'runner' && url.pathname === '/runner-sw.js') {
        const hashes = {};
        const resources = {};
        for (const publicPath of ['/bootstrap.html', '/bootstrap.js', '/worker.js', '/runner-prepare.html', '/runner-prepare.js']) {
          const publicBytes = await readFile(resolve(root, '.' + publicPath));
          hashes[publicPath] = createHash('sha256').update(publicBytes).digest('hex');
          resources[publicPath] = { body: publicBytes.toString(), headers: { 'Content-Type': mime[extname(publicPath)], 'Content-Security-Policy': publicPath === '/worker.js' ? workerPolicy : bootstrapPolicy } };
        }
        res.end(bytes.toString().replace('const publicHashes = /* trusted-public-manifest */ {};', 'const publicHashes = ' + JSON.stringify(hashes) + ';').replace('const publicResources = /* trusted-public-bytes */ {};', 'const publicResources = ' + JSON.stringify(resources) + ';') + `\n// synthetic build revision ${revision}\n`);
        return;
      }
      res.end(url.pathname === '/sw.js' || url.pathname === '/runner-sw.js' ? Buffer.concat([bytes, Buffer.from(`\n// synthetic build revision ${revision}\n`)]) : bytes);
    } catch (error) {
      if (!res.headersSent) res.writeHead(404);
      res.end(error instanceof Error ? error.message : 'Request failed');
    }
  });
  server.listen(port, host, () => process.stdout.write(`${role} http://${host}:${port}\n`));
  servers.push(server);
}
const close = () => { for (const server of servers) server.close(); };
process.on('SIGINT', close);
process.on('SIGTERM', close);
