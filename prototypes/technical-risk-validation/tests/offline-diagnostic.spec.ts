import { test, expect } from '@playwright/test';

test('E05 diagnostic separates prepared cache from offline-flag navigation behavior', async ({ page, context, request, browser }, info) => {
  await page.goto('/');
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  const prepared = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const urls: string[] = [];
    for (const name of await caches.keys()) for (const request of await (await caches.open(name)).keys()) urls.push(request.url);
    const cached = await caches.match('/index.html', { ignoreSearch: true });
    return { controller: navigator.serviceWorker.controller?.scriptURL, active: registration?.active?.state, scope: registration?.scope, urls, cachedIndexStatus: cached?.status };
  });
  await context.setOffline(true);
  const offlineFetch = await page.evaluate(async () => {
    try { const response = await fetch('/'); return { status: response.status, error: '' }; }
    catch (error: unknown) { return { status: 0, error: error instanceof Error ? error.message : 'unknown error' }; }
  });
  await info.attach('prepared-cache-offline-diagnostic', { body: JSON.stringify({ browser: browser.version(), prepared, offlineFetch, diagnosticOnly: true, physicalColdLaunch: 'untested', policyPassed: offlineFetch.status === 200 }), contentType: 'application/json' });
  await context.setOffline(false);
  await request.post('/__app-outage?enabled=true');
  try {
    const directOriginStatus = (await request.get('/')).status();
    expect(directOriginStatus).toBe(503);
    const outageFetch = await page.evaluate(async () => {
      try { const response = await fetch('/'); return { status: response.status, error: '' }; }
      catch (error: unknown) { return { status: 0, error: error instanceof Error ? error.message : 'unknown error' }; }
    });
    await info.attach('controlled-origin-outage', { body: JSON.stringify({ browser: browser.version(), directOriginStatus, outageFetch, diagnosticOnly: true, networkOffline: false, policyPassed: outageFetch.status === 200 }), contentType: 'application/json' });
  } finally { await request.post('/__app-outage?enabled=false'); }
  expect(prepared.active).toBe('activated');
  expect(prepared.cachedIndexStatus).toBe(200);
});
