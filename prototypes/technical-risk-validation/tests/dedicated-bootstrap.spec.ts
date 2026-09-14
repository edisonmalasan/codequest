import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); await expect(page.getByTestId('save-state')).toHaveText('Saved on this device'); });

test('D3 dedicated public cache preserves Worker CSP and excludes data', async ({ page, request }, info) => {
  const first = await page.evaluate(() => window.__risk.run('console.log("initial")', 'dedicated'));
  expect(first.status).toBe('success');
  // Online execution need not wait for downloads; inspect cache only after preparation.
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  const frame = page.frames().find(frame => frame.url().startsWith('http://127.0.0.2:4311/bootstrap.html'));
  if (!frame) throw new Error('Trusted dedicated bootstrap unavailable');
  const inventory = await frame.evaluate(async () => {
    const cache = await caches.open('codequest-runner-public-v1');
    const urls = (await cache.keys()).map(request => request.url).sort();
    const response = await cache.match('/worker.js');
    return { urls, policy: response?.headers.get('Content-Security-Policy'), controlled: Boolean(navigator.serviceWorker.controller) };
  });
  expect(inventory.urls).toEqual(['bootstrap.html', 'bootstrap.js', 'worker.js', 'runner-prepare.html', 'runner-prepare.js'].map(path => 'http://127.0.0.2:4311/' + path).sort());
  expect(inventory.policy).toBe("default-src 'none'; script-src 'unsafe-eval'; connect-src 'none'; worker-src 'none'");
  expect(inventory.controlled).toBe(true);
  for (const path of ['/__protected', '/__mock', '/index.html', '/worker.js?source=PRIVATE']) expect((await request.get('http://127.0.0.2:4311' + path)).status()).toBe(404);
  await info.attach('runner-public-cache-policy', { body: JSON.stringify({ first, inventory }), contentType: 'application/json' });
});

test('D3 learner cache poisoning cannot replace trusted public code or CSP', async ({ page }, info) => {
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  const first = await page.evaluate(() => window.__risk.run('console.log("initial")', 'dedicated'));
  expect(first.status).toBe('success');
  const poison = `const cache=await caches.open("codequest-runner-public-v1");await cache.put("/worker.js",new Response("self.postMessage('POISON_EXECUTED')",{headers:{"Content-Type":"text/javascript","Content-Security-Policy":"default-src *;script-src *"}}));console.log("cache mutated");`;
  const poisoned = await page.evaluate(source => window.__risk.run(source, 'dedicated'), poison);
  expect(poisoned.status).toBe('success');
  const source = await page.evaluate(() => window.__risk.source());
  const fresh = await page.evaluate(() => window.__risk.run('console.log("must not execute poisoned code")', 'dedicated'));
  await info.attach('learner-cache-poisoning', { body: JSON.stringify({ first, poisoned, fresh }), contentType: 'application/json' });
  expect(fresh.status).toBe('success');
  expect(fresh.elapsed).toBeLessThanOrEqual(1000);
  expect(fresh.output).toEqual(['must not execute poisoned code']);
  expect(fresh.output).not.toContain('POISON_EXECUTED');
  expect(await page.evaluate(() => window.__risk.source())).toBe(source);
});

test('D3 dedicated denies child construction and terminates forged output before reuse', async ({ page }, info) => {
  const source = `try { const child = new Worker(URL.createObjectURL(new Blob([${JSON.stringify("self.postMessage('CHILD_EXECUTED');while(true){}") }],{type:"text/javascript"}))); const outcome = await new Promise(resolve=>{child.onmessage=()=>resolve("CHILD_EXECUTED");child.onerror=event=>{event.preventDefault();resolve("CHILD_DENIED")};setTimeout(()=>resolve("CHILD_INCONCLUSIVE"),500);}); child.terminate(); console.log(outcome); } catch(error) {console.log("CHILD_DENIED");}`;
  const child = await page.evaluate(source => window.__risk.run(source, 'dedicated'), source);
  expect(child.status).toBe('success');
  await info.attach('actual-child-capability', { body: JSON.stringify(child), contentType: 'application/json' });
  expect(child.output.join('\n')).toBe('CHILD_DENIED');
  const forged = await page.evaluate(() => window.__risk.run('self.postMessage("forged");while(true){}', 'dedicated'));
  expect(forged.status).toBe('protocol-error');
  expect(forged.cleanup?.acknowledged).toBe(true);
  const fresh = await page.evaluate(() => window.__risk.run('console.log("fresh")', 'dedicated'));
  expect(fresh.status).toBe('success'); expect(fresh.elapsed).toBeLessThanOrEqual(1000);
  await info.attach('dedicated-child-denial', { body: JSON.stringify({ child, forged, fresh, childExecution: 'denied, not a witnessed child-loop recovery' }), contentType: 'application/json' });
});

test('D3 cache metadata and oversized-body poisoning cannot add network authority', async ({ page, request }, info) => {
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  const sink = 'http://127.0.0.1:4312';
  await request.post(sink + '/reset');
  const initial = await page.evaluate(() => window.__risk.run('console.log("initial")', 'dedicated'));
  expect(initial.status).toBe('success');
  const metadataSource = `const cache=await caches.open("codequest-runner-public-v1");const response=await cache.match("/worker.js");const headers=new Headers(response.headers);headers.set("Content-Security-Policy-Report-Only","default-src 'none'; report-uri ${sink}/poison-report");headers.set("Refresh","0;url=${sink}/poison-refresh");await cache.put("/worker.js",new Response(await response.text(),{headers}));console.log("metadata mutated");`;
  const metadata = await page.evaluate(source => window.__risk.run(source, 'dedicated'), metadataSource);
  expect(metadata.status).toBe('success');
  const frame = page.frames().find(frame => frame.url().startsWith('http://127.0.0.2:4311/bootstrap.html'));
  if (!frame) throw new Error('Trusted bootstrap unavailable');
  const delivered = await frame.evaluate(async () => { const response = await fetch('/worker.js'); return { reportOnly: response.headers.get('Content-Security-Policy-Report-Only'), refresh: response.headers.get('Refresh'), policy: response.headers.get('Content-Security-Policy') }; });
  expect(delivered.reportOnly).toBeNull(); expect(delivered.refresh).toBeNull();
  const denied = await page.evaluate(source => window.__risk.run(source, 'dedicated'), `await fetch("${sink}/must-not-request").catch(()=>{});console.log("blocked");`);
  expect(denied.status).toBe('success');
  const oversized = await page.evaluate(() => window.__risk.run('const cache=await caches.open("codequest-runner-public-v1");await cache.put("/worker.js",new Response("x".repeat(1048576),{headers:{"Content-Security-Policy":"default-src \'none\'; script-src \'unsafe-eval\'; connect-src \'none\'; worker-src \'none\'"}}));console.log("oversized public body inserted");', 'dedicated'));
  expect(oversized.status).toBe('success');
  const fresh = await page.evaluate(() => window.__risk.run('console.log("after oversized cache body")', 'dedicated'));
  await page.waitForTimeout(200);
  const records: unknown = await (await request.get(sink + '/records')).json();
  await info.attach('cache-metadata-byte-guard', { body: JSON.stringify({ metadata, delivered, denied, oversized, fresh, records, injectedBodyBytes: 1048576, trustedReadLimitBytes: 65536 }), contentType: 'application/json' });
  expect(fresh.status).toBe('success'); expect(fresh.elapsed).toBeLessThanOrEqual(1000); expect(records).toEqual([]);
});

test('D3 prepared offline cache deletion and bootstrap poisoning preserve trusted recovery', async ({ page, context }, info) => {
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  const initial = await page.evaluate(() => window.__risk.run('console.log("initial")', 'dedicated'));
  expect(initial.status).toBe('success');
  const original = await page.evaluate(() => window.__risk.source());
  await context.setOffline(true);
  const mutation = await page.evaluate(() => window.__risk.run('await caches.delete("codequest-runner-public-v1");console.log("cache deleted");', 'dedicated'));
  expect(mutation.status).toBe('success');
  const fresh = await page.evaluate(() => window.__risk.run('console.log("offline fresh")', 'dedicated'));
  expect(fresh.status).toBe('success'); expect(fresh.elapsed).toBeLessThanOrEqual(1000);
  const source = `const cache=await caches.open("codequest-runner-public-v1");await cache.put("/bootstrap.js",new Response("parent.postMessage('POISON_BOOTSTRAP_EXECUTED','*')",{headers:{"Content-Security-Policy":"default-src *"}}));console.log("bootstrap cache poisoned");`;
  const poisoned = await page.evaluate(source => window.__risk.run(source, 'dedicated'), source);
  expect(poisoned.status).toBe('success');
  await page.evaluate(() => window.__risk.dispose());
  const recreated = await page.evaluate(() => window.__risk.run('console.log("safe recreated bootstrap")', 'dedicated'));
  await info.attach('offline-public-cache-recovery', { body: JSON.stringify({ initial, mutation, fresh, poisoned, recreated, offlineMode: 'Playwright network emulation; not physical network disconnection' }), contentType: 'application/json' });
  expect(recreated.status).toBe('success'); expect(recreated.elapsed).toBeLessThanOrEqual(1000);
  expect(recreated.output).toEqual(['safe recreated bootstrap']);
  expect(await page.evaluate(() => window.__risk.source())).toBe(original);
});

test('D3 dedicated ten witnessed loops and 100 fresh Worker cycles meet original budgets', async ({ page }, info) => {
  // Collector allowance covers 110 original bounded runs, not a runtime grace period.
  test.setTimeout(300000);
  const source = await page.evaluate(() => window.__risk.source());
  const loops = [];
  for (let trial = 0; trial < 10; trial++) {
    await page.evaluate(() => { window.__bootstrapLoop = window.__risk.run('while(true){}', 'dedicated', 'Q01', true); });
    let witnessed = false;
    let markerError = '';
    try { await page.waitForFunction(() => Boolean(document.querySelector('iframe[data-preview-started="yes"]')), undefined, { timeout: 1900 }); witnessed = true; }
    catch (error: unknown) { markerError = error instanceof Error ? error.message : 'Marker unavailable'; }
    const loop = await page.evaluate(() => window.__bootstrapLoop);
    const fresh = await page.evaluate(() => window.__risk.run('console.log("recovered")', 'dedicated'));
    loops.push({ trial, witnessed, markerError, loop, fresh });
    await info.attach('dedicated-loop-' + trial, { body: JSON.stringify({ trial, witnessed, markerError, loop, fresh }), contentType: 'application/json' });
  }
  const cycles = await page.evaluate(async () => {
    const results = [];
    for (let trial = 0; trial < 100; trial++) results.push(await window.__risk.run('console.log("cycle")', 'dedicated'));
    return results;
  });
  await info.attach('dedicated-frozen-lifecycle', { body: JSON.stringify({ loops, cycles }), contentType: 'application/json' });
  expect(loops.every(row => row.witnessed && row.loop.status === 'timeout' && row.loop.elapsed <= 3000 && row.fresh.status === 'success' && row.fresh.elapsed <= 1000)).toBe(true);
  expect(cycles.every(result => result.status === 'success' && result.elapsed <= 1000)).toBe(true);
  expect(await page.evaluate(() => window.__risk.source())).toBe(source);
  await page.evaluate(() => window.__risk.dispose()); await expect(page.locator('iframe')).toHaveCount(0);
});
