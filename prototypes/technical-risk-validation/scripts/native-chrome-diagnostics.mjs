import { chromium, expect } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { createConnection } from 'node:net';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';

const profileRoot = resolve('../../temp/phase1-profiles');
await mkdir(profileRoot, { recursive: true });
const profile = await mkdtemp(join(profileRoot, 'native-chrome-'));
const storageDenied = process.argv.includes('--storage-denied');
if (storageDenied) {
  await mkdir(join(profile, 'Default'));
  await writeFile(join(profile, 'Default', 'Preferences'), JSON.stringify({ profile: { default_content_setting_values: { cookies: 2 } } }));
}
const endpoints = [['127.0.0.1', 4310], ['127.0.0.2', 4311], ['127.0.0.1', 4312]];
const origin = 'http://127.0.0.1:4310';
const source = 'console.log("Ready for CodeQuest");';
const assets = {};
const buildRoot = resolve('dist');
function freeze(directory) {
  for (const item of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) freeze(path);
    else assets[relative(buildRoot, path).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(path)).digest('hex');
  }
}
freeze(buildRoot);
const record = {
  recordedAt: new Date().toISOString(), experiment: 'E01/E05 native Chrome diagnostics', command: process.argv,
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  dirtyPaths: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean),
  buildHashesFrozenBeforeTrials: assets, scriptHash: createHash('sha256').update(readFileSync('scripts/native-chrome-diagnostics.mjs')).digest('hex'),
  channel: 'chrome', headed: true, viewportEmulation: false, physicalTyping: false,
  storageDeniedProfile: storageDenied ? 'task-only Preferences: profile.default_content_setting_values.cookies=2; actual denial must be observed' : false,
  launchOptions: { channel: 'chrome', headless: false, viewport: null, timeout: 15000 },
  browserUse: 'no dedicated Browser Use/computer tool exposed; Playwright/CDP interaction',
  assistiveTechnology: 'NVDA/VoiceOver untested', operatingSystemRestart: 'untested; active user development session not restarted',
};
if (process.argv.includes('--occlusion-control')) {
  record.launchOptions.args = ['--disable-backgrounding-occluded-windows'];
  record.configurationControl = 'one diagnostic Windows-occlusion flag; not normal Chrome or production selection';
}
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
let installed = false;
let cdp;
let manifestId = origin + '/';
async function sampleResources(label) {
  const snapshot = { label, recordedAt: new Date().toISOString(), hardMemoryQuota: 'unverified' };
  try {
    const browser = context.browser();
    if (!browser) throw new Error('Owned browser CDP session unavailable');
    const browserSession = await browser.newBrowserCDPSession();
    try {
      const { processInfo } = await browserSession.send('SystemInfo.getProcessInfo');
      snapshot.processCounts = processInfo.reduce((counts, process) => { counts[process.type] = (counts[process.type] ?? 0) + 1; return counts; }, {});
      snapshot.totalCpuSeconds = processInfo.reduce((total, process) => total + process.cpuTime, 0);
    } finally { await browserSession.detach(); }
    await cdp.send('Performance.enable');
    const { metrics } = await cdp.send('Performance.getMetrics');
    snapshot.hostMetrics = metrics.filter(metric => ['JSHeapUsedSize', 'JSHeapTotalSize', 'Documents', 'Nodes', 'JSEventListeners', 'TaskDuration'].includes(metric.name));
  } catch (error) { snapshot.limitation = error instanceof Error ? error.message : String(error); }
  record.resourceSnapshots ??= [];
  record.resourceSnapshots.push(snapshot);
}
async function stopServer() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  await new Promise((resolveExit, reject) => {
    const timer = setTimeout(() => { server.kill('SIGKILL'); reject(new Error('Owned server failed teardown')); }, 5000);
    server.once('exit', () => { clearTimeout(timer); resolveExit(); });
    server.kill('SIGTERM');
  });
}
async function ready(page) {
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
}
async function launchApp() {
  const before = context.pages();
  const result = await cdp.send('PWA.launch', { manifestId });
  await expect.poll(() => context.pages().filter(page => !before.includes(page)).length).toBeGreaterThan(0);
  const page = context.pages().find(page => !before.includes(page));
  if (!page) throw new Error('PWA target did not become inspectable');
  await ready(page);
  return { page, target: result.targetId };
}
try {
  record.stage = 'port preflight';
  if ((await Promise.all(endpoints.map(([host, port]) => portState(host, port)))).some(row => row.reachable)) throw new Error('Task ports in use; existing services untouched');
  server = spawn(process.execPath, ['--max-old-space-size=96', 'scripts/serve.mjs'], { windowsHide: true, stdio: 'ignore' });
  await expect.poll(async () => (await Promise.all(endpoints.map(([host, port]) => portState(host, port)))).every(row => row.reachable), { timeout: 5000 }).toBe(true);
  context = await chromium.launchPersistentContext(profile, record.launchOptions);
  record.nativeWindow = JSON.parse(execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'scripts/focus-native-window.ps1', '-ParentPid', String(process.pid)], { encoding: 'utf8', timeout: 15000 }));
  let page = context.pages()[0];
  if (!page) throw new Error('No native Chrome page');
  cdp = await context.newCDPSession(page);
  record.pageErrors = [];
  page.on('pageerror', error => { if (record.pageErrors.length < 16) record.pageErrors.push(error.message.slice(0, 2000)); });
  record.version = await cdp.send('Browser.getVersion');
  try { record.browserCommandLine = (await cdp.send('Browser.getBrowserCommandLine')).arguments.map(arg => arg.startsWith('--user-data-dir=') ? '--user-data-dir=<task-owned>' : arg); }
  catch (error) { record.browserCommandLineLimitation = error instanceof Error ? error.message : String(error); }
  await page.goto(origin + '/');
  if (storageDenied) {
    record.stage = 'native storage-denied startup';
    record.nativeStorageAccess = await page.evaluate(async () => {
      const observations = {};
      for (const name of ['localStorage', 'sessionStorage']) {
        try { window[name].setItem('SYNTHETIC_POLICY_CONTROL', 'SYNTHETIC_ONLY'); observations[name] = { permitted: true }; }
        catch (error) { observations[name] = { permitted: false, error: error instanceof Error ? error.message : String(error) }; }
      }
      try {
        observations.indexedDB = await new Promise((resolveAccess, reject) => {
          const request = indexedDB.open('SYNTHETIC_POLICY_CONTROL');
          request.onsuccess = () => { request.result.close(); resolveAccess({ permitted: true }); };
          request.onerror = () => reject(request.error);
        });
      } catch (error) { observations.indexedDB = { permitted: false, error: error instanceof Error ? error.message : String(error) }; }
      return observations;
    });
    try {
      await expect(page.getByTestId('save-state')).toContainText(/Storage unavailable|Save failed/);
      const editor = page.getByRole('textbox', { name: 'JavaScript source' });
      await editor.fill(source);
      await expect(page.getByTestId('save-state')).toContainText('Save failed');
      record.storageDeniedRecovery = { editable: true, exactSourceRetained: await page.evaluate(expected => window.__risk.source() === expected, source), saveState: await page.getByTestId('save-state').textContent() };
    } finally { record.storageDeniedPageText = (await page.locator('body').innerText()).slice(0, 16384); }
  } else {
  await ready(page);
  await expect(page.getByText(/Public lesson and runtime assets prepared offline/)).toBeVisible();
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill(source); await ready(page);

  record.stage = 'native lifecycle and bootstrap diagnostics';
  await page.bringToFront();
  await sampleResources('before ten Worker loops and hundred Worker/preview cycles');
  record.workerLoopTrials = [];
  for (let trial = 0; trial < 10; trial++) {
    await page.evaluate(() => { window.__nativeWorkerTrial = window.__risk.run('while(true){}', 'dedicated', 'Q01', true); });
    let markerObserved = false;
    let markerError = '';
    try { await page.waitForFunction(() => Boolean(document.querySelector('iframe[data-preview-started="yes"]')), undefined, { timeout: 1900 }); markerObserved = true; }
    catch (error) { markerError = error instanceof Error ? error.message : String(error); }
    await page.getByRole('button', { name: 'Show hint' }).click();
    const result = await page.evaluate(() => window.__nativeWorkerTrial);
    const fresh = await page.evaluate(() => window.__risk.run('console.log("fresh")', 'dedicated'));
    record.workerLoopTrials.push({ trial, markerObserved, markerError, result, fresh, exactSourceRetained: await page.evaluate(expected => window.__risk.source() === expected, source) });
  }
  record.lifecycle = await page.evaluate(async () => {
    const rows = [];
    for (let cycle = 0; cycle < 100; cycle++) {
      const result = await window.__risk.run('console.log("native cycle")', 'dedicated');
      rows.push({ cycle, status: result.status, elapsed: result.elapsed, sourcePreserved: window.__risk.source() === 'console.log("Ready for CodeQuest");', remainingCompartments: document.querySelectorAll('iframe[title="Learner execution compartment"]').length, trustedBootstrapFrames: document.querySelectorAll('iframe[data-trusted-bootstrap="yes"]').length, acknowledgedActiveWorkers: document.querySelectorAll('iframe[data-active-workers="1"]').length, cleanup: result.cleanup });
    }
    const previews = [];
    for (let cycle = 0; cycle < 100; cycle++) {
      const start = performance.now();
      const pending = window.__risk.previewSource('function summarize(){return 5}');
      while (!document.querySelector('iframe[title="Supplied Worker result preview"]') && performance.now() - start < 1000) await new Promise(resolveDelay => setTimeout(resolveDelay, 10));
      const ready = Boolean(document.querySelector('iframe[title="Supplied Worker result preview"]'));
      const readinessMs = performance.now() - start;
      const bootstrapPresentAtBoundary = Boolean(document.querySelector('iframe[title="Learner execution compartment"]'));
      window.__risk.stop();
      previews.push({ cycle, ready, readinessMs, bootstrapPresentAtBoundary, result: await pending, sourcePreserved: window.__risk.source() === 'console.log("Ready for CodeQuest");', remainingFrames: document.querySelectorAll('iframe').length, trustedBootstrapFrames: document.querySelectorAll('iframe[data-trusted-bootstrap="yes"]').length, acknowledgedActiveWorkers: document.querySelectorAll('iframe[data-active-workers="1"]').length });
    }
    return { rows, previews, warmupWithinEachTotal: 10, hardMemoryQuota: 'unverified', visibility: document.visibilityState, clock: 'monotonic browser clocks; no added GPU/renderer restrictions', physicalTyping: false };
  });

  record.stage = 'native page zoom settings';
  await sampleResources('after ten Worker loops and hundred Worker/preview cycles');
  if (process.argv.includes('--retention-control')) {
    for (const [delay, label] of [[10000, 'ten seconds natural idle after lifecycle'], [20000, 'thirty seconds natural idle after lifecycle']]) {
      await page.waitForTimeout(delay);
      await sampleResources(label);
    }
    record.retentionControl = 'natural idle observation only; no forced GC, quota or altered acceptance budget';
  }
  const baseline = await page.evaluate(() => ({ dpr: devicePixelRatio, width: innerWidth, height: innerHeight }));
  record.zoom = { baseline, trials: [] };
  const settings = await context.newPage();
  try {
    await settings.goto('chrome://settings/appearance');
    const zoom = settings.locator('select').filter({ has: settings.locator('option[value="4"]') });
    await expect(zoom).toHaveCount(1);
    record.zoom.options = await zoom.locator('option').evaluateAll(options => options.map(option => ({ label: option.textContent, value: option.value })));
    for (const factor of [2, 4]) {
      await zoom.selectOption(String(factor));
      await page.bringToFront(); await page.reload(); await ready(page);
      const observed = await page.evaluate(() => ({ dpr: devicePixelRatio, width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth }));
      const sourcePreserved = await page.evaluate(expected => window.__risk.source() === expected, source);
      const trial = { requestedFactor: factor, observed, sourcePreserved, actualBrowserZoomObserved: Math.abs(observed.dpr / baseline.dpr - factor) < 0.05 };
      record.zoom.trials.push(trial);
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      try { await expect(page.getByTestId('feedback')).toContainText('Local check passed'); trial.localCheckPassed = true; }
      catch (error) { trial.localCheckPassed = false; trial.error = error instanceof Error ? error.message : String(error); }
      const imagePath = resolve(`../../temp/native-chrome-zoom-${factor * 100}.png`);
      const capture = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
      await writeFile(imagePath, Buffer.from(capture.data, 'base64'));
      trial.screenshotMethod = 'CDP viewport surface; prior Playwright full-page captures clipped at page zoom';
      record.zoom.trials.at(-1).screenshotHash = createHash('sha256').update(readFileSync(imagePath)).digest('hex');
    }
    await zoom.selectOption('1');
    record.zoom.verdict = record.zoom.trials.every(row => row.actualBrowserZoomObserved && row.sourcePreserved && row.localCheckPassed) ? 'passed native page zoom and essential check/source retention' : 'failed or inconclusive; inspect actual geometry, source and check result';
  } catch (error) { record.zoom.verdict = 'inconclusive'; record.zoom.error = error instanceof Error ? error.message : String(error); }
  await settings.close(); await page.bringToFront();

  record.stage = 'native window minimize and restore';
  try {
    const window = await cdp.send('Browser.getWindowForTarget');
    await cdp.send('Browser.setWindowBounds', { windowId: window.windowId, bounds: { windowState: 'minimized' } });
    const hidden = await page.evaluate(() => document.visibilityState);
    await new Promise(resolveDelay => setTimeout(resolveDelay, 1000));
    await cdp.send('Browser.setWindowBounds', { windowId: window.windowId, bounds: { windowState: 'normal' } });
    await page.bringToFront();
    record.windowLifecycle = { minimizedVisibility: hidden, resumedVisibility: await page.evaluate(() => document.visibilityState), exactSourceRetained: await page.evaluate(expected => window.__risk.source() === expected, source), mobileLifecycle: 'untested' };
    record.windowLifecycle.verdict = hidden === 'hidden' ? 'observed native minimize/resume with source retained' : 'inconclusive; command accepted but hidden state not observed';
  } catch (error) { record.windowLifecycle = { verdict: 'inconclusive', error: error instanceof Error ? error.message : String(error) }; }

  record.stage = 'PWA installability inspection';
  record.manifest = await cdp.send('Page.getAppManifest');
  record.installability = await cdp.send('Page.getInstallabilityErrors');
  const appId = await cdp.send('Page.getAppId');
  manifestId = new URL(appId.recommendedId ?? appId.appId ?? manifestId, origin).href;
  record.manifestId = manifestId;
  if (record.installability.installabilityErrors.length > 0) {
    record.pwa = { verdict: 'unsupported by this fixture/configuration', reason: record.installability.installabilityErrors, browserInstallSupport: 'not inferred universally' };
  } else {
    try {
      await cdp.send('PWA.install', { manifestId, installUrlOrBundleUrl: origin + '/' }); installed = true;
      await cdp.send('PWA.changeAppUserSettings', { manifestId, displayMode: 'standalone' });
      record.pwa = { install: 'passed', osState: await cdp.send('PWA.getOsAppState', { manifestId }) };
      const app = await launchApp();
      page = app.page;
      record.pwa.displayModeStandalone = await page.evaluate(() => matchMedia('(display-mode: standalone)').matches);
      record.pwa.installedModeVerdict = record.pwa.displayModeStandalone ? 'standalone display observed' : 'inconclusive; install/launch succeeded but standalone display not observed';
      record.pwa.target = app.target;
      record.pwa.persistenceCycles = [];
      await page.getByRole('button', { name: 'Check', exact: true }).click();
      await expect(page.getByTestId('feedback')).toContainText('Local check passed');
      await page.getByRole('button', { name: 'Save pending snapshot' }).click();
      await expect(page.getByTestId('feedback')).toContainText('Snapshot pending');
      const pending = await page.evaluate(() => window.__risk.pending());
      for (const [mode, count] of [['reload', 8], ['update', 6], ['multiclient', 6]]) {
        for (let cycle = 0; cycle < count; cycle++) {
          let other;
          let current = source + `\n// installed ${mode} ${cycle}`;
          await page.getByRole('textbox', { name: 'JavaScript source' }).fill(current); await ready(page);
          if (mode !== 'reload') {
            if (mode === 'multiclient') { other = await context.newPage(); await other.goto(origin + '/'); await ready(other); }
            await fetch(origin + '/__revision', { method: 'POST' });
            await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
            const update = page.getByRole('button', { name: 'Save draft and apply available update' });
            await expect(update).toBeVisible();
            current += '\n// editing with pending update';
            await page.getByRole('textbox', { name: 'JavaScript source' }).fill(current);
            await update.click();
            await expect.poll(() => page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); return !registration?.waiting && registration?.active?.state === 'activated'; })).toBe(true);
          }
          await page.reload(); await ready(page);
          expect(await page.evaluate(() => window.__risk.source())).toBe(current);
          expect(await page.evaluate(() => window.__risk.pending())).toEqual(pending);
          if (other) { await other.reload(); await ready(other); expect(await other.evaluate(() => window.__risk.source())).toBe(current); await other.close(); }
          record.pwa.persistenceCycles.push({ mode, cycle, exactSourceRetained: true, immutablePendingRetained: true });
        }
      }
      await page.getByRole('textbox', { name: 'JavaScript source' }).fill(source); await ready(page);
      await context.close(); context = undefined;
      await stopServer();
      record.pwa.originControls = await Promise.all(endpoints.map(([host, port]) => portState(host, port)));
      if (record.pwa.originControls.some(row => row.reachable || row.error !== 'ECONNREFUSED')) throw new Error('Cold PWA origin refusal not established');
      context = await chromium.launchPersistentContext(profile, record.launchOptions);
      const initial = context.pages()[0];
      if (!initial) throw new Error('Missing reopened browser page');
      cdp = await context.newCDPSession(initial);
      const cold = await launchApp();
      expect(await cold.page.evaluate(() => window.__risk.source())).toBe(source);
      await cold.page.getByRole('button', { name: 'Check', exact: true }).click();
      await expect(cold.page.getByTestId('feedback')).toContainText('Local check passed');
      record.pwa.coldOriginUnreachableRelaunch = { exactSourceRetained: true, localCheckProvisional: true, displayModeStandalone: await cold.page.evaluate(() => matchMedia('(display-mode: standalone)').matches), physicalNetworkDisconnect: false };
    } catch (error) { record.pwa = { ...record.pwa, verdict: 'inconclusive or failed installation/lifecycle diagnostic', error: error instanceof Error ? error.message : String(error) }; }
  }
  }
  record.stage = 'diagnostic collection complete';
} catch (error) {
  record.error = error instanceof Error ? error.message : String(error); process.exitCode = 1;
} finally {
  if (installed && cdp) {
    try { await cdp.send('PWA.uninstall', { manifestId }); record.pwaUninstalled = true; }
    catch (error) { record.pwaUninstallError = error instanceof Error ? error.message : String(error); process.exitCode = 1; }
  }
  try { await context?.close(); await stopServer(); }
  catch (error) { record.cleanupError = error instanceof Error ? error.message : String(error); process.exitCode = 1; }
  const target = resolve(profile);
  if (!target.startsWith(profileRoot + sep)) throw new Error('Task profile cleanup escaped declared root');
  await rm(target, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  record.taskProfileRemoved = true;
  record.recordedAt = new Date().toISOString();
  await writeFile('../../docs/technical-risk-validation/evidence/native-chrome-' + record.recordedAt.replaceAll(':', '-') + '.json', JSON.stringify(record, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ recordedAt: record.recordedAt, stage: record.stage, error: record.error, nativeWindow: record.nativeWindow, workerFailures: record.lifecycle?.rows.filter(row => row.status !== 'success').length, previewFailures: record.lifecycle?.previews.filter(row => !row.ready).length, zoom: record.zoom?.verdict, pwaInstall: record.pwa?.install, standalone: record.pwa?.displayModeStandalone, pwaError: record.pwa?.error, pwaUninstalled: record.pwaUninstalled, taskProfileRemoved: record.taskProfileRemoved }) + '\n');
}
