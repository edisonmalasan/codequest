import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

async function workerState(page: Page): Promise<unknown> {
  return page.evaluate(() => new Promise<unknown>((resolve, reject) => {
    const controller = navigator.serviceWorker.controller;
    if (!controller) { reject(new Error('Missing diagnostic controller')); return; }
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Diagnostic ping timed out')); }, 1000);
    channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data); };
    controller.postMessage('synthetic diagnostic ping', [channel.port2]);
  }));
}

test('E05 diagnostic isolates offline emulation from the application and cache library', async ({ page, context, browser }, info) => {
  const fixtureHashes = Object.fromEntries(['offline-control.html', 'offline-control-worker.js'].map(name => [name, createHash('sha256').update(readFileSync('scripts/fixtures/' + name)).digest('hex')]));
  await page.goto('/__offline-control/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/__offline-control/sw.js');
    await navigator.serviceWorker.ready;
  });
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL)).toContain('/__offline-control/sw.js');
  const fetchControl = () => page.evaluate(async () => {
    try {
      const response = await fetch('/__offline-control/probe');
      return { status: response.status, body: await response.text(), error: '' };
    } catch (error: unknown) { return { status: 0, body: '', error: error instanceof Error ? error.message : 'unknown error' }; }
  });
  const online = await fetchControl();
  expect(online).toMatchObject({ status: 200, body: '<h1>SYNTHETIC_SW_RESPONSE</h1>' });
  const before = await workerState(page);
  await context.setOffline(true);
  try {
    const pageOnline = await page.evaluate(() => navigator.onLine);
    const offline = await fetchControl();
    const after = await workerState(page);
    let navigationError = '';
    try { await page.goto('/__offline-control/', { timeout: 3000 }); }
    catch (error: unknown) { navigationError = error instanceof Error ? error.message : 'unknown error'; }
    await info.attach('minimal-worker-offline-control', { body: JSON.stringify({ browser: browser.version(), fixtureHashes, online, before, pageOnline, offline, after, navigationError, offlinePolicyPassed: offline.status === 200 && navigationError === '', diagnosticOnly: true, physical: false, scope: 'fixed in-memory service-worker Response; no Serwist/React/IndexedDB/learner execution' }), contentType: 'application/json' });
  } finally { await context.setOffline(false); }
});
