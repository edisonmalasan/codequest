import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SimulationLedger, snapshotFrom } from '../src/mock.ts';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const ledger = new SimulationLedger();
const records = [];
let revision = 1;
const workerPolicy = "default-src 'none'; script-src 'unsafe-eval'; connect-src 'none'; worker-src 'none'";
const bootstrapPolicy = "default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const servers = [];

for (const [host, port, role] of [['127.0.0.1', 4310, 'app'], ['127.0.0.2', 4311, 'runner'], ['127.0.0.1', 4312, 'sink']]) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://${host}:${port}`);
      res.setHeader('Cache-Control', 'no-store');
      if (role === 'sink') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        if (url.pathname === '/records') { res.end(JSON.stringify(records)); return; }
        if (url.pathname === '/reset' && req.method === 'POST') { records.length = 0; res.end('{}'); return; }
        if (records.length < 2000) records.push({ method: req.method, path: url.pathname, query: url.search.slice(0, 300), at: Date.now() });
        res.end('{}'); return;
      }
      if (url.pathname === '/__revision' && req.method === 'POST') { revision++; res.end(String(revision)); return; }
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
      if (role === 'runner') res.setHeader('Content-Security-Policy', url.pathname === '/worker.js' ? workerPolicy : bootstrapPolicy);
      if (role === 'app' && url.searchParams.get('framePolicy') === 'none') res.setHeader('Content-Security-Policy', "frame-src 'none'");
      res.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream');
      if (!(await stat(path)).isFile()) { res.writeHead(404); res.end(); return; }
      const bytes = await readFile(path);
      res.end(url.pathname === '/sw.js' ? Buffer.concat([bytes, Buffer.from(`\n// synthetic build revision ${revision}\n`)]) : bytes);
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
