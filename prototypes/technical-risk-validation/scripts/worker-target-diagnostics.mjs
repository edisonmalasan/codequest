import { chromium } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, resolve } from 'node:path';

const attachControl = process.argv.includes('--attach-control');
const native = process.argv.includes('--chrome');
const candidate = process.argv.includes('--dedicated') ? 'dedicated' : 'opaque';
const record = {
  recordedAt: new Date().toISOString(), command: process.argv,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  dirtyPaths: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean),
  experiment: 'E02 target-lifecycle diagnostic', attachControl, candidate,
  channel: native ? 'installed chrome' : 'bundled chromium', physicalTyping: false,
  limitation: 'Target descriptors and current-process CPU observations; no hard quota or confirmed per-target CPU attribution',
  scriptHash: createHash('sha256').update(readFileSync('scripts/worker-target-diagnostics.mjs')).digest('hex'),
  buildHashesFrozenBeforeTrials: {}, snapshots: [],
};
const buildRoot = resolve('dist');
function freeze(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, item.name);
    if (item.isDirectory()) freeze(file);
    else record.buildHashesFrozenBeforeTrials[relative(buildRoot, file).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(file)).digest('hex');
  }
}
freeze(buildRoot);
const free = (host, port) => new Promise(resolveFree => {
  const socket = createConnection({ host, port });
  socket.on('connect', () => { socket.destroy(); resolveFree(false); });
  socket.on('error', error => resolveFree(error.code === 'ECONNREFUSED'));
});
let server;
let browser;
try {
  if (!(await Promise.all([['127.0.0.1', 4310], ['127.0.0.2', 4311], ['127.0.0.1', 4312]].map(([host, port]) => free(host, port)))).every(Boolean)) throw new Error('Fixture ports occupied; existing services untouched');
  server = spawn(process.execPath, ['scripts/serve.mjs'], { windowsHide: true, stdio: 'ignore' });
  await new Promise(resolveDelay => setTimeout(resolveDelay, 1500));
  browser = await chromium.launch(native ? { channel: 'chrome', headless: false } : {});
  const page = await browser.newPage({ viewport: native ? null : { width: 1280, height: 720 } });
  await page.goto('http://127.0.0.1:4310/');
  await page.getByTestId('save-state').waitFor();
  const cdp = await browser.newBrowserCDPSession();
  record.version = await cdp.send('Browser.getVersion');
  const targets = async () => (await cdp.send('Target.getTargets')).targetInfos.filter(target => target.type === 'worker');
  const snapshot = async label => record.snapshots.push({ label, recordedAt: new Date().toISOString(), targets: await targets(), processes: await cdp.send('SystemInfo.getProcessInfo') });
  await snapshot('before');
  const child = 'self.postMessage("CHILD_STARTED");while(true){}';
  const source = candidate === 'dedicated' ? 'while(true){}' : `const child=new Worker(URL.createObjectURL(new Blob([${JSON.stringify(child)}],{type:'text/javascript'})));await new Promise(resolve=>{child.onmessage=()=>{};child.onerror=()=>resolve()});`;
  record.sourceHash = createHash('sha256').update(source).digest('hex');
  await page.evaluate(({ source, candidate }) => { window.__targetTrial = window.__risk.run(source, candidate, 'Q01', true); }, { source, candidate });
  record.parentMarkerObserved = false;
  try { await page.waitForFunction(() => Boolean(document.querySelector('iframe[data-preview-started="yes"]')), undefined, { timeout: 1900 }); record.parentMarkerObserved = true; }
  catch (error) { record.markerError = error.message; }
  for (let attempt = 0; attempt < 100 && (await targets()).length < (candidate === 'dedicated' ? 1 : 2); attempt++) await new Promise(resolveDelay => setTimeout(resolveDelay, 10));
  await snapshot('active');
  await page.evaluate(() => window.__risk.stop());
  record.stopped = await page.evaluate(() => window.__targetTrial);
  await snapshot('immediately after acknowledged stop');
  if (attachControl) {
    record.attachments = [];
    for (const target of await targets()) {
      try {
        const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: target.targetId, flatten: false });
        let response;
        const receive = event => { if (event.sessionId === sessionId) response = event.message; };
        cdp.on('Target.receivedMessageFromTarget', receive);
        await cdp.send('Target.sendMessageToTarget', { sessionId, message: JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: '1+1' } }) });
        await new Promise(resolveDelay => setTimeout(resolveDelay, 200));
        record.attachments.push({ targetId: target.targetId, response: response ?? 'no reply in 200ms' });
        cdp.off('Target.receivedMessageFromTarget', receive);
        await cdp.send('Target.detachFromTarget', { sessionId });
      } catch (error) { record.attachments.push({ targetId: target.targetId, error: error.message }); }
    }
  }
  for (const delay of [100, 900, 1000]) {
    await new Promise(resolveDelay => setTimeout(resolveDelay, delay));
    await snapshot('natural elapsed interval +' + delay + 'ms');
  }
  record.fresh = await page.evaluate(candidate => window.__risk.run('console.log("fresh after target observation")', candidate), candidate);
  await page.evaluate(() => window.__risk.dispose());
  await snapshot('after explicit disposal');
} catch (error) { record.error = error.message; }
finally {
  await browser?.close();
  if (server && server.exitCode === null && server.signalCode === null) {
    const exited = new Promise(resolveExit => server.once('exit', resolveExit));
    server.kill('SIGTERM');
    await exited;
  }
  const file = '../../docs/technical-risk-validation/evidence/worker-target-diagnostics-' + record.recordedAt.replaceAll(':', '-') + '.json';
  writeFileSync(file, JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify({ file, error: record.error, snapshots: record.snapshots.map(snapshot => ({ label: snapshot.label, targets: snapshot.targets.length })), stopped: record.stopped, fresh: record.fresh }));
}
