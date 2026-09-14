import { test, expect } from '@playwright/test';
import { isRecord } from '../src/protocol';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
});

test('E02/E03 private cleanup remains separate from forged learner output and bootstrap reuse', async ({ page, browser }, info) => {
  const original = await page.evaluate(() => window.__risk.source());
  const first = await page.evaluate(() => window.__risk.run('console.log("first")', 'opaque'));
  expect(first.status).toBe('success');
  expect(first.cleanup).toEqual({ acknowledged: true, fallback: false, retainedTrustedBootstrap: true });
  const bootstrap = page.locator('iframe[data-trusted-bootstrap="yes"]');
  await expect(bootstrap).toHaveCount(1);
  await expect(bootstrap).toHaveAttribute('data-active-workers', '0');
  await page.evaluate(() => {
    const frame = document.querySelector('iframe[data-trusted-bootstrap="yes"]');
    if (frame) frame.setAttribute('data-reuse-witness', 'original');
  });
  const forged = await page.evaluate(() => window.__risk.run('self.postMessage(JSON.stringify({type:"cleaned",ticket:"FORGED",activeWorkers:0}));while(true){}', 'opaque'));
  expect(forged.status).toBe('protocol-error');
  expect(forged.cleanup?.acknowledged).toBe(true);
  await expect(bootstrap).toHaveAttribute('data-active-workers', '0');
  await expect(bootstrap).toHaveAttribute('data-reuse-witness', 'original');
  const fresh = await page.evaluate(() => window.__risk.run('console.log("fresh")', 'opaque'));
  expect(fresh.status).toBe('success');
  expect(fresh.elapsed).toBeLessThan(1000);
  expect(fresh.cleanup?.acknowledged).toBe(true);
  expect(await page.evaluate(() => window.__risk.source())).toBe(original);
  await page.evaluate(() => window.__risk.dispose());
  await expect(page.locator('iframe')).toHaveCount(0);
  await info.attach('private-cleanup-reuse', { body: JSON.stringify({ browser: browser.version(), first, forged, fresh, exactSourceRetained: true, disposedFrames: 0, physicalMobile: 'untested' }), contentType: 'application/json' });
});

test('E02 missing private acknowledgment removes bootstrap within bounded fallback and restarts', async ({ page, browser }, info) => {
  const first = await page.evaluate(() => window.__risk.run('console.log("initial")', 'opaque'));
  expect(first.status).toBe('success');
  await page.evaluate(() => { window.__bootstrapLoop = window.__risk.run('while(true){}', 'opaque', 'Q01', true); });
  await page.waitForFunction(() => Boolean(document.querySelector('iframe[data-preview-started="yes"]')));
  const handle = await page.locator('iframe[data-preview-started="yes"]').elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error('Active trusted bootstrap missing');
  // Explicit trusted-control fault injection, never learner API access.
  await frame.evaluate('control.onmessage = null');
  const start = Date.now();
  await page.evaluate(() => window.__risk.stop());
  const stopped = await page.evaluate(() => window.__bootstrapLoop);
  expect(stopped.status).toBe('stopped');
  expect(stopped.cleanup).toEqual({ acknowledged: false, fallback: true, retainedTrustedBootstrap: false });
  expect(Date.now() - start).toBeLessThan(1000);
  await expect(page.locator('iframe[data-trusted-bootstrap="yes"]')).toHaveCount(0);
  const fresh = await page.evaluate(() => window.__risk.run('console.log("after fallback")', 'opaque'));
  expect(fresh.status).toBe('success');
  expect(fresh.elapsed).toBeLessThan(1000);
  await page.evaluate(() => window.__risk.dispose());
  await expect(page.locator('iframe')).toHaveCount(0);
  await info.attach('missing-ack-fallback', { body: JSON.stringify({ browser: browser.version(), stopped, fresh, injection: 'trusted bootstrap private handler deliberately disabled', additionalRecoveryLimitMs: 1000, configuredFallbackMs: 100 }), contentType: 'application/json' });
});

test('E02 superseded runs and unsolicited stop-shaped window messages cannot replace fresh output', async ({ page, browser }, info) => {
  const result = await page.evaluate(async () => {
    const old = window.__risk.run('await new Promise(r=>setTimeout(r,500));console.log("stale")', 'opaque');
    const fresh = window.__risk.run('console.log("current")', 'opaque');
    window.postMessage({ type: 'cleaned', ticket: 'FORGED_WINDOW', activeWorkers: 0 }, '*');
    return { old: await old, fresh: await fresh };
  });
  expect(result.old.status).toBe('stopped');
  expect(result.fresh.status).toBe('success');
  expect(result.fresh.output).toEqual(['current']);
  expect(result.fresh.elapsed).toBeLessThan(1000);
  await expect(page.locator('iframe[data-active-workers="1"]')).toHaveCount(0);
  await expect(page.locator('iframe[data-trusted-bootstrap="yes"]')).toHaveCount(1);
  await info.attach('superseded-private-control', { body: JSON.stringify({ browser: browser.version(), result }), contentType: 'application/json' });
});

test('E02 replayed actual prior output from the retained bootstrap cannot fail the current run', async ({ page, browser }, info) => {
  const captured = await page.evaluate(async () => {
    let packet: unknown;
    const observe = (event: MessageEvent<unknown>) => {
      if (!Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe[data-trusted-bootstrap="yes"]')).some(frame => frame.contentWindow === event.source)) return;
      const data = event.data;
      const raw = typeof data === 'string' ? data : typeof data === 'object' && data !== null && 'raw' in data ? data.raw : undefined;
      if (typeof raw === 'string' && raw.includes('"status":"success"')) packet = data;
    };
    window.addEventListener('message', observe);
    try { const first = await window.__risk.run('console.log("prior")', 'opaque'); return { first, packet }; }
    finally { window.removeEventListener('message', observe); }
  });
  expect(captured.first.status).toBe('success');
  expect(typeof captured.packet === 'string' || isRecord(captured.packet)).toBe(true);
  await page.evaluate(() => { window.__bootstrapLoop = window.__risk.run('await new Promise(r=>setTimeout(r,300));console.log("current")', 'opaque'); });
  const handle = await page.locator('iframe[data-active-workers="1"]').elementHandle();
  const frame = await handle?.contentFrame();
  if (!frame) throw new Error('Current trusted bootstrap unavailable for replay');
  await frame.evaluate(packet => parent.postMessage(packet, '*'), captured.packet);
  const current = await page.evaluate(() => window.__bootstrapLoop);
  expect(current.status).toBe('success');
  expect(current.output).toEqual(['current']);
  expect(current.elapsed).toBeLessThan(1000);
  expect(current.cleanup?.acknowledged).toBe(true);
  await info.attach('actual-prior-output-replay', { body: JSON.stringify({ browser: browser.version(), captured, current, replaySender: 'actual same retained bootstrap window', physical: false }), contentType: 'application/json' });
});

test.describe('Chromium target instrumentation', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Browser-specific target instrumentation unavailable; not a Firefox/WebKit target-lifecycle pass');
  test('E02 CDP observes parent and nested Worker targets disappear after private cleanup', async ({ page, browser }, info) => {
    const cdp = await browser.newBrowserCDPSession();
    const workerTargets = async () => (await cdp.send('Target.getTargets')).targetInfos.filter(target => target.type === 'worker');
    try {
      const before = await workerTargets();
      expect(before).toHaveLength(0);
      const child = 'self.postMessage("CHILD_STARTED");while(true){}';
      const source = `const child=new Worker(URL.createObjectURL(new Blob([${JSON.stringify(child)}],{type:'text/javascript'})));await new Promise(resolve=>{child.onmessage=()=>{};child.onerror=()=>resolve()});`;
      await page.evaluate(source => { window.__bootstrapLoop = window.__risk.run(source, 'opaque', 'Q01', true); }, source);
      await page.waitForFunction(() => Boolean(document.querySelector('iframe[data-preview-started="yes"]')));
      await expect.poll(async () => (await workerTargets()).length, { timeout: 1500, intervals: [10, 25, 50] }).toBe(2);
      const active = await workerTargets();
      const start = Date.now();
      await page.evaluate(() => window.__risk.stop());
      const stopped = await page.evaluate(() => window.__bootstrapLoop);
      expect(stopped.status).toBe('stopped');
      expect(stopped.cleanup?.acknowledged).toBe(true);
      const afterAcknowledgment = await workerTargets();
      await info.attach('worker-targets-after-ack', { body: JSON.stringify({ before, active, stopped, afterAcknowledgment }), contentType: 'application/json' });
      await expect.poll(async () => (await workerTargets()).length, { timeout: 1000, intervals: [10, 25, 50] }).toBe(0);
      const recoveryMs = Date.now() - start;
      expect(recoveryMs).toBeLessThan(1000);
      const fresh = await page.evaluate(() => window.__risk.run('console.log("after observed descendant cleanup")', 'opaque'));
      expect(fresh.status).toBe('success');
      expect(fresh.elapsed).toBeLessThan(1000);
      await page.evaluate(() => window.__risk.dispose());
      await expect(page.locator('iframe')).toHaveCount(0);
      await info.attach('actual-worker-target-cleanup', { body: JSON.stringify({ browser: browser.version(), before, active, after: await workerTargets(), stopped, recoveryMs, fresh, childExplicitlyTerminatedByFixture: false, limitation: 'owned Chrome target observation, not a hard CPU/memory quota or cross-browser instrumentation claim' }), contentType: 'application/json' });
    } finally { await cdp.detach(); }
  });
});

declare global {
  interface Window {
    __bootstrapLoop: ReturnType<Window['__risk']['run']>;
  }
}
