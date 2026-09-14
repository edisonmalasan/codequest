import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await request.post('http://127.0.0.1:4312/reset');
  await page.goto('/?framePolicy=isolated');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
});

test('E04 Worker supplied shell renders useful results and hostile markup as inert text', async ({ page, request, browser }, info) => {
  await page.evaluate(() => { void window.__risk.previewSource('function summarize(records){return records.reduce((n,r)=>n+r.quantity,0)}'); });
  const shell = page.frameLocator('iframe[title="Supplied Worker result preview"]');
  await expect(shell.locator('pre')).toHaveText('5');
  await expect(page.getByText('Text equivalent: 5', { exact: true })).toBeVisible();
  const frame = page.locator('iframe[title="Supplied Worker result preview"]');
  await expect(frame).toHaveAttribute('sandbox', '');
  await page.evaluate(() => window.__risk.stop());
  const hostile = '<script>while(true){}</script><img src="http://127.0.0.1:4312/image"><style>@import "http://127.0.0.1:4312/css";</style><iframe src="http://127.0.0.1:4312/frame"></iframe><form action="http://127.0.0.1:4312/form"></form><a href="http://127.0.0.1:4312/nav">navigate</a>';
  await page.evaluate(source => { void window.__risk.previewSource(source); }, `function summarize(){return ${JSON.stringify(hostile)}}`);
  await expect(shell.locator('pre')).toHaveText(hostile);
  await expect(shell.locator('img, script, style, iframe, form, a')).toHaveCount(0);
  expect(await (await request.get('http://127.0.0.1:4312/records')).json()).toEqual([]);
  await info.attach('worker-shell-denial', { body: JSON.stringify({ browser: browser.version(), usefulTotal: '5', hostileMarkup: 'inert text, not executable DOM', sinkRequests: [], physical: false }), contentType: 'application/json' });
});

test('E04 Worker preview ten verified infinite loops recover with usable host and exact source', async ({ page, browser }, info) => {
  test.setTimeout(60000);
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill('console.log("source retained during preview")');
  const rows = [];
  for (let trial = 0; trial < 10; trial++) {
    await page.evaluate(() => { window.__previewRecovery = window.__risk.previewSource('while(true){}'); });
    await page.waitForFunction(() => Boolean(document.querySelector('iframe[data-preview-started="yes"]')));
    await page.getByRole('button', { name: 'Show hint' }).click();
    const result = await page.evaluate(() => window.__previewRecovery);
    expect(result.status).toBe('preview-timeout');
    expect(result.elapsed).toBeGreaterThanOrEqual(1900);
    expect(result.elapsed).toBeLessThan(3000);
    await expect(page.locator('iframe[title="Learner execution compartment"]')).toHaveCount(0);
    expect(await page.evaluate(() => window.__risk.source())).toBe('console.log("source retained during preview")');
    const start = Date.now();
    await page.evaluate(() => { void window.__risk.previewSource('function summarize(){return 5}'); });
    await expect(page.frameLocator('iframe[title="Supplied Worker result preview"]').locator('pre')).toHaveText('5', { timeout: 1000 });
    expect(Date.now() - start).toBeLessThan(1000);
    await page.evaluate(() => window.__risk.stop());
    rows.push({ trial, result, freshRunMs: Date.now() - start, hostInteraction: true, exactSourceRetained: true });
  }
  await info.attach('worker-preview-recovery', { body: JSON.stringify({ browser: browser.version(), rows, physical: false, marker: 'trusted Worker dispatch immediately before executing source', emergencyTermination: false }), contentType: 'application/json' });
});

test('E04 Worker preview hundred starts and resets reject flooding without leaked compartments', async ({ page, browser }, info) => {
  test.setTimeout(60000);
  const rows = await page.evaluate(async () => {
    const rows = [];
    for (let cycle = 0; cycle < 100; cycle++) {
      const pending = window.__risk.previewSource('function summarize(){return 5}');
      const deadline = performance.now() + 1000;
      while (!document.querySelector("iframe[title=\"Supplied Worker result preview\"]")) {
        if (performance.now() >= deadline) throw new Error("Fresh preview exceeded one-second budget");
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      window.__risk.stop();
      rows.push({ cycle, ...await pending });
    }
    const flood = await window.__risk.previewSource('for(let i=0;i<1000;i++)self.postMessage("spoof")');
    return { rows, flood };
  });
  expect(rows.rows.every(row => row.status === 'preview-stopped')).toBe(true);
  expect(rows.flood.status).toBe('protocol-error');
  await expect(page.locator('iframe[title="Learner execution compartment"], iframe[title="Supplied Worker result preview"]')).toHaveCount(0);
  expect(rows.flood.execution?.cleanup).toBeDefined();
  // An acknowledged stop retains one bootstrap; the approved fallback removes it.
  await expect(page.locator('iframe[data-trusted-bootstrap="yes"]')).toHaveCount(rows.flood.execution?.cleanup?.retainedTrustedBootstrap ? 1 : 0);
  await expect(page.locator('iframe[data-active-workers="1"]')).toHaveCount(0);
  await page.evaluate(() => window.__risk.dispose());
  await expect(page.locator('iframe')).toHaveCount(0);
  await info.attach('worker-preview-resets', { body: JSON.stringify({ browser: browser.version(), ...rows, physical: false, retainedMemoryQuota: 'unverified' }), contentType: 'application/json' });
});

declare global {
  interface Window {
    __previewRecovery: ReturnType<Window['__risk']['previewSource']>;
  }
}

test('E04/E05 Worker preview retains containment after offline preparation and public asset update', async ({ page, context, request, browser }, info) => {
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await request.post('/__revision');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await registration?.update();
  });
  await expect(page.getByRole('button', { name: 'Save draft and apply available update' })).toBeVisible();
  await page.getByRole('button', { name: 'Save draft and apply available update' }).click();
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return !registration?.waiting && registration?.active?.state === 'activated';
  })).toBe(true);
  // Canonical app URL is prepared; diagnostic header-query routes are not precached.
  await page.goto('/');
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await page.evaluate(() => { void window.__risk.previewSource('function summarize(){return 5}'); });
  await expect(page.frameLocator('iframe[title="Supplied Worker result preview"]').locator('pre')).toHaveText('5');
  await expect(page.getByText('Text equivalent: 5', { exact: true })).toBeVisible();
  await page.evaluate(() => window.__risk.stop());
  await context.setOffline(false);
  const outcome = await page.evaluate(() => window.__risk.previewSource('fetch("http://127.0.0.1:4312/after-update").catch(()=>{});function summarize(){return 5}'));
  expect(outcome.status).toBe('preview-reset');
  expect(await (await request.get('http://127.0.0.1:4312/records')).json()).toEqual([]);
  await info.attach('worker-preview-offline-update', { body: JSON.stringify({ browser: browser.version(), sameProcessOfflineReload: true, publicAssetUpdate: true, onlineLearnerRequests: [], physicalColdLaunch: 'untested' }), contentType: 'application/json' });
});


test('E03/E04 online authority probes remain denied after public update independently of offline emulation', async ({ page, request, browser }, info) => {
  test.setTimeout(60000);
  await expect(page.getByText(/Public lesson and runtime assets prepared offline/)).toBeVisible();
  await request.post('/__revision');
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
  await page.getByRole('button', { name: 'Save draft and apply available update' }).click();
  await expect.poll(() => page.evaluate(async () => !(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(true);
  await page.reload();
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await request.post('http://127.0.0.1:4312/reset');
  await page.evaluate(async () => { await fetch('http://127.0.0.1:4312/post-update-control'); });
  const control: unknown = await (await request.get('http://127.0.0.1:4312/records')).json();
  expect(control).toEqual(expect.arrayContaining([expect.objectContaining({ path: '/post-update-control' })]));
  await request.post('http://127.0.0.1:4312/reset');
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open('application-canary', 1);
      open.onupgradeneeded = () => open.result.createObjectStore('secrets');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const transaction = open.result.transaction('secrets', 'readwrite');
        transaction.objectStore('secrets').put('SYNTHETIC_SESSION_ONLY', 'token');
        transaction.oncomplete = () => { open.result.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
    if (!(await indexedDB.databases()).some(database => database.name === 'application-canary')) throw new Error('Trusted application storage control missing');
  });
  const probes = [
    ['fetch', 'await fetch("http://127.0.0.1:4312/update-fetch")'],
    ['xhr', 'const x=new XMLHttpRequest();x.open("GET","http://127.0.0.1:4312/update-xhr");x.send()'],
    ['socket', 'new WebSocket("ws://127.0.0.1:4312/update-socket")'],
    ['import', 'await import("http://127.0.0.1:4312/update-import")'],
    ['importScripts', 'importScripts("http://127.0.0.1:4312/update-script")'],
    ['nestedWorker', 'new Worker("http://127.0.0.1:4312/update-worker")'],
    ['protected', 'await fetch("http://127.0.0.1:4310/__protected");console.log("APP_FOUND")'],
    ['storage', 'console.log(typeof document);console.log(typeof localStorage);try{console.log((await indexedDB.databases()).some(d=>d.name==="application-canary")?"APP_FOUND":"APP_NOT_FOUND")}catch(e){}'],
  ];
  const rows = [];
  for (const [id, body] of probes) {
    const source = 'try{' + body + '}catch(e){};function summarize(){return 5}';
    const result = await page.evaluate(source => window.__risk.previewSource(source), source);
    rows.push({ id, result });
    expect(result.status, id).toBe('preview-reset');
    expect(result.execution?.output).not.toContain('APP_FOUND');
    await page.evaluate(() => window.__risk.stop());
  }
  const records: unknown = await (await request.get('http://127.0.0.1:4312/records')).json();
  expect(records).toEqual([]);
  await info.attach('online-post-update-authority', { body: JSON.stringify({ browser: browser.version(), control, rows, records, offlineEmulation: false, physicalMobile: 'untested' }), contentType: 'application/json' });
});
