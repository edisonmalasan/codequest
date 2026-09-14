import { chromium } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, resolve } from 'node:path';

const record = { recordedAt: new Date().toISOString(), experiment: 'E02 native startup stage diagnostic', command: process.argv, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), dirtyPaths: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean), scriptHash: createHash('sha256').update(readFileSync('scripts/native-startup-diagnostics.mjs')).digest('hex'), buildHashesFrozenBeforeTrials: {}, instrumentation: 'Document-only Worker constructor/message and private-port receive timestamps; no learner Worker instrumentation, policy or deadline changes. Diagnostic, not acceptance replacement.', events: [], cycles: [] };
const buildRoot = resolve('dist');
const candidate = process.argv.includes('--dedicated') ? 'dedicated' : 'opaque';
record.candidate = candidate;
record.hostileFirst = process.argv.includes('--hostile-first');
function freeze(directory) { for (const item of readdirSync(directory, { withFileTypes: true })) { const file = join(directory, item.name); if (item.isDirectory()) freeze(file); else record.buildHashesFrozenBeforeTrials[relative(buildRoot, file).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(file)).digest('hex'); } }
freeze(buildRoot);
const free = (host, port) => new Promise(resolveFree => { const socket = createConnection({ host, port }); socket.on('connect', () => { socket.destroy(); resolveFree(false); }); socket.on('error', error => resolveFree(error.code === 'ECONNREFUSED')); });
let server;
let browser;
try {
  if (!(await Promise.all([['127.0.0.1', 4310], ['127.0.0.2', 4311], ['127.0.0.1', 4312]].map(([host, port]) => free(host, port)))).every(Boolean)) throw new Error('Fixture ports occupied; existing services untouched');
  server = spawn(process.execPath, ['scripts/serve.mjs'], { windowsHide: true, stdio: 'ignore' });
  await new Promise(resolveDelay => setTimeout(resolveDelay, 1500));
  browser = await chromium.launch({ channel: 'chrome', headless: false });
  const page = await browser.newPage({ viewport: null });
  page.on('console', message => { const text = message.text(); if (text.startsWith('CQ_STAGE:') && record.events.length < 3000) record.events.push(JSON.parse(text.slice(9))); });
  await page.addInitScript(() => {
    const log = (stage, run) => console.debug('CQ_STAGE:' + JSON.stringify({ stage, run: typeof run === 'string' ? run : '', time: performance.timeOrigin + performance.now(), document: location.href, visible: document.visibilityState }));
    const NativeWorker = Worker;
    window.Worker = new Proxy(NativeWorker, { construct(target, args) { log('worker-constructor-before'); const worker = Reflect.construct(target, args); log('worker-constructor-after'); worker.addEventListener('message', () => log('worker-result-received')); worker.addEventListener('error', () => log('worker-error')); return worker; } });
    const descriptor = Object.getOwnPropertyDescriptor(MessagePort.prototype, 'onmessage');
    if (descriptor?.set) Object.defineProperty(MessagePort.prototype, 'onmessage', { ...descriptor, set(handler) { descriptor.set.call(this, typeof handler === 'function' ? function(event) { log('port-receive:' + (event.data?.type ?? String(event.data)), event.data?.input?.run ?? event.data?.identity?.run); return handler.call(this, event); } : handler); } });
    addEventListener('message', event => { if (event.data?.type === 'opaque-bootstrap-ready' || event.data?.type === 'learner-output') log('window-receive:' + event.data.type, event.data.identity?.run); });
  });
  await page.goto('http://127.0.0.1:4310/');
  await page.getByTestId('save-state').waitFor();
  const cdp = await browser.newBrowserCDPSession();
  record.version = await cdp.send('Browser.getVersion');
  if (record.hostileFirst) {
    record.hostileTrials = [];
    for (let trial = 0; trial < 10; trial++) {
      const source = 'while(true){}';
      await page.evaluate(({ source, candidate }) => { window.__startupLoop = window.__risk.run(source, candidate, 'Q01', true); }, { source, candidate });
      let markerObserved = false;
      let markerError = '';
      try { await page.waitForFunction(() => Boolean(document.querySelector('iframe[data-preview-started="yes"]')), undefined, { timeout: 1900 }); markerObserved = true; }
      catch (error) { markerError = String(error); }
      record.hostileTrials.push({ trial, markerObserved, markerError, result: await page.evaluate(() => window.__startupLoop) });
    }
  }
  for (let cycle = 0; cycle < 100; cycle++) {
    const before = Date.now();
    const result = await page.evaluate(candidate => window.__risk.run('console.log("diagnostic fresh")', candidate), candidate);
    record.cycles.push({ cycle, before, result });
  }
  record.verdict = record.cycles.every(row => row.result.status === 'success' && row.result.elapsed <= 1000) ? 'passed instrumented diagnostic; original failures not erased' : 'failed instrumented fresh-run diagnostic';
  await page.evaluate(() => window.__risk.dispose());
  record.stage = 'completed';
} catch (error) { record.error = String(error); record.stage = 'failed'; process.exitCode = 1; }
finally { await browser?.close(); server?.kill(); const file = '../../docs/technical-risk-validation/evidence/native-startup-diagnostics-' + record.recordedAt.replaceAll(':', '-') + '.json'; writeFileSync(file, JSON.stringify(record, null, 2) + '\n'); console.log(JSON.stringify({ file, verdict: record.verdict, cycles: record.cycles.length, failed: record.cycles.filter(row => row.result.status !== 'success' || row.result.elapsed > 1000).map(row => ({ cycle: row.cycle, elapsed: row.result.elapsed, status: row.result.status })), error: record.error })); }
