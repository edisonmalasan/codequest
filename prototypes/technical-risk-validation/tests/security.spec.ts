import { test, expect } from '@playwright/test';

const sink = 'http://127.0.0.1:4312';
test.beforeEach(async ({ page, request }) => { await page.goto('/'); await expect(page.getByTestId('save-state')).toHaveText('Saved on this device'); await request.post(sink + '/reset'); });

test('E03 positive and permissive negative controls observe real requests', async ({ page, request }, info) => {
  await page.evaluate(async (url) => { await fetch(url + '/positive?fixture=CONTROL'); }, sink);
  const control = await page.evaluate((url) => window.__risk.run(`await fetch(${JSON.stringify(url + '/negative?fixture=CONTROL')});console.log('requested')`, 'control'), sink);
  expect(control.output).toEqual(['requested']);
  const records: unknown = await (await request.get(sink + '/records')).json();
  expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ path: '/positive' }), expect.objectContaining({ path: '/negative' })]));
  await info.attach('sink-control', { body: JSON.stringify(records), contentType: 'application/json' });
});

for (const candidate of ['opaque', 'dedicated'] as const) {
  test(`E03 ${candidate} network/import/nested requests are denied online`, async ({ page, request, browser }, info) => {
    const fixtures = [
      ['fetch', `try{await fetch('${sink}/fetch?fixture=FETCH')}catch(e){console.log('blocked')}`],
      ['xhr', `try{const x=new XMLHttpRequest();x.open('GET','${sink}/xhr?fixture=XHR');x.send();await new Promise(r=>setTimeout(r,100));}catch(e){console.log('blocked')}`],
      ['socket', `try{new WebSocket('ws://127.0.0.1:4312/socket?fixture=WS');await new Promise(r=>setTimeout(r,100));}catch(e){console.log('blocked')}`],
      ['import', `try{await import('${sink}/import?fixture=IMPORT')}catch(e){console.log('blocked')}`],
      ['importScripts', `try{importScripts('${sink}/script?fixture=SCRIPT')}catch(e){console.log('blocked')}`],
      ['nested', `try{new Worker('${sink}/worker?fixture=NESTED');await new Promise(r=>setTimeout(r,100));}catch(e){console.log('blocked')}`],
      ['beacon', `try{navigator.sendBeacon('${sink}/beacon?fixture=BEACON','x')}catch(e){console.log('unavailable')}`],
      ['protected', `try{await fetch('http://127.0.0.1:4310/__protected');console.log('unexpected access')}catch(e){console.log('blocked')}`],
    ];
    const evidence = [];
    for (const [id, source] of fixtures) {
      if (!source) throw new Error('Missing source');
      const result = await page.evaluate(({ source, candidate }) => window.__risk.run(source, candidate), { source, candidate });
      expect(result.status, id).toBe('success');
      expect(result.output).not.toContain('unexpected access');
      evidence.push({ id, result });
    }
    const records: unknown = await (await request.get(sink + '/records')).json();
    expect(records).toEqual([]);
    await info.attach('requests', { body: JSON.stringify({ browser: browser.version(), candidate, fixtures: evidence, records }), contentType: 'application/json' });
  });

  test(`E03 ${candidate} cannot read application IndexedDB or session canary`, async ({ page }, info) => {
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('application-canary', 1);
        open.onupgradeneeded = () => open.result.createObjectStore('secrets');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const tx = open.result.transaction('secrets', 'readwrite'); tx.objectStore('secrets').put('SYNTHETIC_SESSION_ONLY', 'token');
          tx.oncomplete = () => { open.result.close(); resolve(); }; tx.onerror = () => reject(tx.error);
        };
      });
    });
    const source = `try{const databases=await indexedDB.databases();console.log(databases.some(d=>d.name==='application-canary')?'APP_FOUND':'APP_NOT_FOUND')}catch(e){console.log('storage blocked')}console.log(typeof localStorage);console.log(typeof document);`;
    const result = await page.evaluate(({ source, candidate }) => window.__risk.run(source, candidate), { source, candidate });
    expect(result.status).toBe('success'); expect(result.output).not.toContain('APP_FOUND');
    expect(result.output.join('\n')).not.toContain('SYNTHETIC_SESSION_ONLY');
    await info.attach('storage', { body: JSON.stringify(result), contentType: 'application/json' });
  });
}

test('E03 malformed messages cannot become trusted output or privileged host actions', async ({ page }) => {
  const result = await page.evaluate(() => window.__risk.run('self.postMessage(JSON.stringify({status:"accepted",output:["<img src=x onerror=alert(1)>"]}));await new Promise(r=>setTimeout(r,500))', 'opaque'));
  expect(result.status).toBe('protocol-error');
  await expect(page.locator('main img')).toHaveCount(0);
  const text = await page.evaluate(() => window.__risk.run(`console.log(${JSON.stringify('<script>parent.document.body.innerHTML="bad"</script>')})`, 'opaque'));
  expect(text.status).toBe('success');
  await expect(page.getByRole('heading', { name: 'CodeQuest validation workspace' })).toBeVisible();
});

test('E04 preview resource/parent/navigation/form probes are denied', async ({ page, request }, info) => {
  const html = `<img src="${sink}/image?fixture=IMAGE"><style>body{background:url('${sink}/css?fixture=CSS')}</style><script src="${sink}/script?fixture=SCRIPT"></script><iframe src="${sink}/frame?fixture=FRAME"></iframe><form action="${sink}/form?fixture=FORM"><input name=x value=y></form><script>try{parent.document.body.dataset.escaped='yes'}catch(e){}try{fetch('${sink}/fetch?fixture=PREVIEW')}catch(e){}try{document.forms[0].submit()}catch(e){}try{top.location='${sink}/top?fixture=TOP'}catch(e){}try{window.open('${sink}/popup?fixture=POPUP')}catch(e){}</script>`;
  const result = await page.evaluate((html) => window.__risk.preview(html), html);
  expect(result.elapsed).toBeLessThan(3000);
  expect(await page.locator('body').getAttribute('data-escaped')).toBeNull();
  const records: unknown = await (await request.get(sink + '/records')).json(); expect(records).toEqual([]);
  await info.attach('preview', { body: JSON.stringify({ result, records }), contentType: 'application/json' });
});

test('E04 preview self-navigation capability is explicitly measured', async ({ page, request }, info) => {
  const result = await page.evaluate((url) => window.__risk.preview(`<script>location.href='${url}/self-navigation?fixture=SELF_NAV'</script>`), sink);
  const records: unknown = await (await request.get(sink + '/records')).json();
  // Diagnostic result, not an allowed exception: any request is a policy failure in the report.
  await info.attach('self-navigation-risk', { body: JSON.stringify({ result, records, policyPassed: Array.isArray(records) && records.length === 0 }), contentType: 'application/json' });
  expect(result.elapsed).toBeLessThan(3000);
});

test('E04 parent frame policy comparison retains original navigation failure', async ({ page, request }, info) => {
  await page.goto('/?framePolicy=none');
  await expect(page.getByRole('heading', { name: 'CodeQuest validation workspace' })).toBeVisible();
  const worker = await page.evaluate(() => window.__risk.run('console.log("ready")', 'opaque'));
  const preview = await page.evaluate((url) => window.__risk.preview(`<h1>Supplied shell</h1><script>location.href='${url}/parent-policy?fixture=PARENT_CSP'</script>`), sink);
  const records: unknown = await (await request.get(sink + '/records')).json();
  await info.attach('parent-frame-policy', { body: JSON.stringify({ worker, preview, records, policyPassed: worker.status === 'success' && Array.isArray(records) && records.length === 0, parentPolicy: "frame-src 'none'", physical: false }), contentType: 'application/json' });
});

test('E02 lifecycle one hundred runs retain usability and leave no runtime frames', async ({ page }, info) => {
  test.setTimeout(60000);
  const timings = await page.evaluate(async () => {
    const rows = [];
    for (let cycle = 0; cycle < 100; cycle++) {
      const result = await window.__risk.run('console.log("cycle")', 'opaque');
      rows.push({ cycle, status: result.status, elapsed: result.elapsed });
    }
    return rows;
  });
  expect(timings.every((row) => row.status === 'success')).toBe(true);
  await expect(page.locator('iframe[title="Learner execution compartment"]')).toHaveCount(0);
  await info.attach('lifecycle', { body: JSON.stringify({ timings, hardMemoryQuota: 'unverified', manualPhysicalCoverage: false }), contentType: 'application/json' });
});

test('E03 restricted cache/channel API inventory and wrong-source messages', async ({ page }, info) => {
  await page.evaluate(async () => { await (await caches.open('APP_SYNTHETIC_ONLY')).put('/canary', new Response('SYNTHETIC_SESSION_ONLY')); });
  const results = [];
  for (const candidate of ['opaque', 'dedicated'] as const) {
    const result = await page.evaluate(candidate => window.__risk.run(`console.log(typeof fetch,typeof indexedDB,typeof caches,typeof BroadcastChannel,typeof WebSocket,typeof Worker,typeof document,typeof localStorage);try{console.log((await caches.keys()).includes('APP_SYNTHETIC_ONLY')?'APP_FOUND':'APP_NOT_FOUND')}catch(e){console.log('cache blocked')}`, candidate), candidate);
    expect(result.status).toBe('success'); expect(result.output.join('\n')).not.toContain('APP_FOUND');
    results.push(result);
  }
  const correlated = await page.evaluate(async () => {
    const run = window.__risk.run('await new Promise(r=>setTimeout(r,100));console.log("current")', 'opaque');
    window.postMessage(JSON.stringify({ status: 'accepted', output: ['spoof'] }), '*');
    return run;
  });
  expect(correlated.output).toEqual(['current']);
  await info.attach('api-inventory', { body: JSON.stringify({ results, correlated, channelCrossOriginBehavior: 'not established by API availability; separate cross-origin probe required' }), contentType: 'application/json' });
});
