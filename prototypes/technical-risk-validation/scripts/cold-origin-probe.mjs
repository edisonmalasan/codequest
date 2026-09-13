import { chromium, firefox, webkit, expect } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';

// Functional cold-process diagnostic. This is not physical-input B07 evidence.
const engine = process.argv[2] ?? 'chromium';
const browserType = { chromium, firefox, webkit, chrome: chromium }[engine];
if (!browserType) throw new Error('Expected chromium, firefox, webkit or chrome');
const trials = engine === 'chrome' ? 10 : 1;
const endpoints = [['127.0.0.1', 4310], ['127.0.0.2', 4311], ['127.0.0.1', 4312]];
const shortProfile = process.argv.includes('--short-profile');
const profileRoot = resolve(shortProfile ? '../../temp/phase1-profiles' : '.profiles');
await mkdir(profileRoot, { recursive: true });
const profile = await mkdtemp(join(profileRoot, 'cold-origin-'));
const source = 'console.log("Ready for CodeQuest");';
const hashes = {};
const buildRoot = resolve('dist');
function freeze(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) freeze(path);
    else hashes[relative(buildRoot, path).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(path)).digest('hex');
  }
}
freeze(buildRoot);
const record = {
  recordedAt: new Date().toISOString(), experiment: 'E05/E06 cold origin-unreachable diagnostic', engine,
  command: process.argv, node: process.version, physical: false, networkOffline: false,
  offlineEmulation: false, trials, b07PhysicalTiming: 'untested; no physical network disconnect or lower-powered designation',
  installedChrome: engine === 'chrome', interaction: engine === 'chrome' ? 'headed native Windows Chrome, automated interaction' : 'headless bundled browser',
  profileLocation: shortProfile ? 'task-only repository temp/phase1-profiles' : 'prototype .profiles',
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  dirtyPaths: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean),
  buildHashesFrozenBeforeTrial: hashes,
  scriptHash: createHash('sha256').update(readFileSync('scripts/cold-origin-probe.mjs')).digest('hex'),
  serverHash: createHash('sha256').update(readFileSync('scripts/serve.mjs')).digest('hex'),
  sourceHash: createHash('sha256').update(source).digest('hex'),
  skipHostDependencyPreflight: process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS === '1',
};
function portState(host, port) {
  return new Promise(resolveState => {
    const socket = createConnection({ host, port });
    const finish = state => { socket.destroy(); resolveState({ host, port, ...state }); };
    socket.setTimeout(1000, () => finish({ reachable: false, error: 'timeout' }));
    socket.on('connect', () => finish({ reachable: true }));
    socket.on('error', error => finish({ reachable: false, error: error.code }));
  });
}
let server;
let context;
async function stopServer() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  const child = server;
  await new Promise((resolveExit, reject) => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error('Owned fixture server did not stop within five seconds')); }, 5000);
    child.once('exit', () => { clearTimeout(timer); resolveExit(); });
    child.kill('SIGTERM');
  });
}
const launchOptions = { headless: engine !== 'chrome', ...(engine === 'chrome' ? { channel: 'chrome' } : {}), args: engine === 'chromium' ? ['--disable-gpu', '--renderer-process-limit=2'] : [], timeout: 15000 };
record.launchOptions = launchOptions;
try {
  record.stage = 'task-port preflight';
  const preflight = await Promise.all(endpoints.map(([host, port]) => portState(host, port)));
  if (preflight.some(row => row.reachable)) throw new Error('Task ports already in use; no existing service was stopped');
  server = spawn(process.execPath, ['--max-old-space-size=96', 'scripts/serve.mjs'], { windowsHide: true, stdio: 'ignore' });
  record.ownedServerPid = server.pid;
  await expect.poll(async () => (await Promise.all(endpoints.map(([host, port]) => portState(host, port)))).every(row => row.reachable), { timeout: 5000 }).toBe(true);
  record.stage = 'online browser preparation';
  context = await browserType.launchPersistentContext(profile, launchOptions);
  record.browserVersion = context.browser()?.version();
  let page = context.pages()[0] ?? await context.newPage();
  await page.goto('http://127.0.0.1:4310/');
  await expect(page.getByText(/Public lesson and runtime assets prepared offline/)).toBeVisible();
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill(source);
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.reload();
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  expect(await page.evaluate(() => window.__risk.source())).toBe(source);
  record.stage = 'prepared browser closure';
  record.preparedController = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL);
  if (!record.preparedController) throw new Error('Preparation did not produce a controlling service worker');
  await context.close(); context = undefined;
  record.preparedBrowserClosedBeforeRelaunch = true;
  await stopServer();
  record.originTransportControls = await Promise.all(endpoints.map(([host, port]) => portState(host, port)));
  if (record.originTransportControls.some(row => row.reachable || row.error !== 'ECONNREFUSED')) throw new Error('Required origin refusal controls not established');
  record.stage = 'cold browser relaunch';
  record.coldTrials = [];
  for (let trial = 0; trial < trials; trial++) {
  const start = performance.now();
  context = await browserType.launchPersistentContext(profile, launchOptions);
  page = context.pages()[0] ?? await context.newPage();
  await page.goto('http://127.0.0.1:4310/', { timeout: 10000 });
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  record.exactSourceRetained = (await page.evaluate(() => window.__risk.source())) === source;
  expect(record.exactSourceRetained).toBe(true);
  record.stage = 'cold provisional check';
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByTestId('feedback')).toContainText('Local check passed');
  record.localCheckProvisional = true;
  record.functionalReadyMs = performance.now() - start;
  record.stage = 'cold supplied preview';
  await page.evaluate(() => { void window.__risk.previewSource('function summarize(){return 5}'); });
  await expect(page.frameLocator('iframe[title="Supplied Worker result preview"]').locator('pre')).toHaveText('5');
  await expect(page.getByText('Text equivalent: 5', { exact: true })).toBeVisible();
  await page.evaluate(() => window.__risk.stop());
  record.suppliedPreviewAndTextPassed = true;
  record.coldTrials.push({ trial, exactSourceRetained: record.exactSourceRetained, localCheckProvisional: true, functionalReadyMs: record.functionalReadyMs, suppliedPreviewAndTextPassed: true, controller: await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL) });
  await context.close(); context = undefined;
  }
  record.stage = 'completed functional diagnostic';
  record.verdict = `passed ${trials} ${engine === 'chrome' ? 'headed installed Chrome' : 'headless'} cold-process origin-unreachable diagnostics; physical/offline-emulation gates not replaced`;
} catch (error) {
  record.verdict = 'failed or inconclusive diagnostic; physical gate remains untested';
  record.error = error instanceof Error ? error.message : String(error);
  const page = context?.pages()[0];
  if (page) {
    try {
      record.failurePageText = (await page.locator('body').innerText({ timeout: 2000 })).slice(0, 16384);
      record.failureEnvironment = await page.evaluate(async () => {
        let registrationError = '';
        let registrations = [];
        try { registrations = await navigator.serviceWorker?.getRegistrations() ?? []; }
        catch (error) { registrationError = error instanceof Error ? error.message : String(error); }
        let cacheDiagnostic;
        try {
          const cache = await caches.open('synthetic-cold-preparation-diagnostic');
          await cache.put('/__synthetic-cache-control', new Response('SYNTHETIC_CACHE_CONTROL'));
          cacheDiagnostic = { savedValue: await (await cache.match('/__synthetic-cache-control'))?.text(), names: await caches.keys() };
        } catch (error) { cacheDiagnostic = { error: error instanceof Error ? error.message : String(error) }; }
        return { secureContext: isSecureContext, serviceWorkerAvailable: 'serviceWorker' in navigator, controller: navigator.serviceWorker?.controller?.scriptURL, registrationError, cacheDiagnostic, registrations: registrations.map(registration => ({ scope: registration.scope, active: registration.active?.state, installing: registration.installing?.state, waiting: registration.waiting?.state })) };
      });
    } catch (error) { record.failureCaptureError = error instanceof Error ? error.message : String(error); }
  }
  process.exitCode = 1;
} finally {
  try { await context?.close(); await stopServer(); }
  catch (error) { record.cleanupError = error instanceof Error ? error.message : String(error); process.exitCode = 1; }
  const target = resolve(profile);
  if (!target.startsWith(profileRoot + sep)) throw new Error('Profile cleanup target escaped task profile root');
  try { await rm(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); record.taskProfileRemoved = true; }
  catch (error) { record.profileCleanupError = error instanceof Error ? error.message : String(error); process.exitCode = 1; }
  record.recordedAt = new Date().toISOString();
  await writeFile('../../docs/technical-risk-validation/evidence/cold-origin-' + record.recordedAt.replaceAll(':', '-') + '.json', JSON.stringify(record, null, 2) + '\n');
  process.stdout.write(JSON.stringify(record) + '\n');
}
