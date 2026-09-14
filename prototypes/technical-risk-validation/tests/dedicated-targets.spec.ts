import { test, expect } from '@playwright/test';

test.describe('D3 dedicated Chromium target instrumentation', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'CDP target instrumentation unavailable; not a Firefox/WebKit lifecycle pass');
  test('dedicated witnessed parent loop leaves no Worker targets within original recovery limit', async ({ page, browser }, info) => {
    await page.goto('/'); await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
    const source = await page.evaluate(() => window.__risk.source());
    const cdp = await browser.newBrowserCDPSession();
    const targets = async () => (await cdp.send('Target.getTargets')).targetInfos.filter(target => target.type === 'worker');
    try {
      const before = await targets(); expect(before).toHaveLength(0);
      await page.evaluate(() => { window.__bootstrapLoop = window.__risk.run('while(true){}', 'dedicated', 'Q01', true); });
      await page.waitForFunction(() => Boolean(document.querySelector('iframe[data-preview-started="yes"]')));
      const active = await targets(); expect(active).toHaveLength(1);
      const start = Date.now(); await page.evaluate(() => window.__risk.stop());
      const stopped = await page.evaluate(() => window.__bootstrapLoop);
      expect(stopped.status).toBe('stopped'); expect(stopped.cleanup?.acknowledged).toBe(true);
      await info.attach('dedicated-targets-after-ack', { body: JSON.stringify({ browser: browser.version(), before, active, stopped, afterAcknowledgment: await targets(), limitation: 'retained target descriptors alone prove neither continuing execution nor termination' }), contentType: 'application/json' });
      await expect.poll(async () => (await targets()).length, { timeout: 1000, intervals: [10, 25, 50] }).toBe(0);
      const recoveryMs = Date.now() - start; expect(recoveryMs).toBeLessThanOrEqual(1000);
      const fresh = await page.evaluate(() => window.__risk.run('console.log("after observed cleanup")', 'dedicated'));
      await info.attach('dedicated-native-target-cleanup', { body: JSON.stringify({ browser: browser.version(), before, active, after: await targets(), stopped, recoveryMs, fresh, limitation: 'owned Chromium target observation; not a hard CPU/memory quota or missing assistive/physical evidence' }), contentType: 'application/json' });
      expect(fresh.status).toBe('success'); expect(fresh.elapsed).toBeLessThanOrEqual(1000);
      expect(await page.evaluate(() => window.__risk.source())).toBe(source);
      await page.evaluate(() => window.__risk.dispose()); await expect(page.locator('iframe')).toHaveCount(0);
    } finally { await cdp.detach(); }
  });
});
