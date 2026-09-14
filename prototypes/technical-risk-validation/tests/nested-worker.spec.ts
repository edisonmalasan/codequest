import { test, expect } from '@playwright/test';

test('E03 nested Blob Worker capability and inherited network policy are observed with a real control', async ({ page, request, browser }, info) => {
  test.setTimeout(45000);
  await page.goto('/');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  const sink = 'http://127.0.0.1:4312';
  const rows = [];
  for (const candidate of ['control', 'opaque', 'dedicated'] as const) {
    await request.post(sink + '/reset');
    const childSource = `fetch('${sink}/nested-blob').then(()=>self.postMessage('NETWORK_REQUEST_ALLOWED'),()=>self.postMessage('NETWORK_REQUEST_DENIED'))`;
    const source = `console.log('SharedWorker:'+typeof SharedWorker);
      if(typeof Worker!=='function'){console.log('NESTED_API_UNAVAILABLE')}
      else {
        const url=URL.createObjectURL(new Blob([${JSON.stringify(childSource)}],{type:'text/javascript'}));
        let child;
        try{child=new Worker(url)}catch(error){console.log('NESTED_CONSTRUCTOR_DENIED:'+error.name)}
        if(child){
          try{
            const response=await new Promise(resolve=>{
              const timer=setTimeout(()=>resolve('NESTED_REPLY_MISSING'),700);
              child.onmessage=event=>{clearTimeout(timer);resolve(event.data)};
              child.onerror=()=>{clearTimeout(timer);resolve('NESTED_BOOTSTRAP_DENIED')};
            });
            console.log(response);
          }finally{child.terminate()}
        }
        URL.revokeObjectURL(url);
      }`;
    const result = await page.evaluate(({ source, candidate }) => window.__risk.run(source, candidate), { source, candidate });
    const records: unknown = await (await request.get(sink + '/records')).json();
    rows.push({ candidate, result, records });
    await info.attach('nested-blob-' + candidate, { body: JSON.stringify({ browser: browser.version(), candidate, result, records, childExplicitlyTerminatedByFixture: true, descendantDeadlineRecovery: 'not demonstrated by this finite capability probe' }), contentType: 'application/json' });
    expect(result.status, candidate).toBe('success');
    expect(result.output).not.toContain('NESTED_REPLY_MISSING');
    if (candidate === 'control') {
      expect(result.output).toContain('NETWORK_REQUEST_ALLOWED');
      expect(records).toEqual(expect.arrayContaining([expect.objectContaining({ path: '/nested-blob' })]));
    } else {
      expect(result.output.some(line => line === 'NETWORK_REQUEST_DENIED' || line === 'NESTED_API_UNAVAILABLE' || line === 'NESTED_BOOTSTRAP_DENIED' || line.startsWith('NESTED_CONSTRUCTOR_DENIED:'))).toBe(true);
      expect(records).toEqual([]);
    }
  }
  await info.attach('nested-blob-comparison', { body: JSON.stringify({ rows, physicalMobile: 'untested', hardResourceQuota: 'unverified' }), contentType: 'application/json' });
});

test('E02/E03 nested Blob loop start triggers bounded rejection and usable fresh execution', async ({ page, browser }, info) => {
  test.setTimeout(60000);
  await page.goto('/');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  const original = await page.evaluate(() => window.__risk.source());
  const rows = [];
  for (const candidate of ['opaque', 'dedicated'] as const) {
    for (let trial = 0; trial < 10; trial++) {
      const child = 'self.postMessage("SYNTHETIC_CHILD_STARTED");while(true){}';
      const source = `let child;const url=URL.createObjectURL(new Blob([${JSON.stringify(child)}],{type:'text/javascript'}));
        try{child=new Worker(url)}catch(error){console.log('NESTED_CONSTRUCTOR_DENIED:'+error.name)}
        if(child)await new Promise(resolve=>{child.onmessage=event=>{if(event.data==='SYNTHETIC_CHILD_STARTED')self.postMessage('SYNTHETIC_CHILD_STARTED');else{console.log('NESTED_UNEXPECTED_MESSAGE');resolve()}};child.onerror=event=>{event.preventDefault();console.log('NESTED_BOOTSTRAP_DENIED');resolve()}});`;
      const observed = await page.evaluate(async ({ source, candidate }) => {
        let childStartObserved = false;
        const observe = (event: MessageEvent<unknown>) => {
          const data = event.data;
          const raw = typeof data === 'object' && data !== null && 'type' in data && data.type === 'learner-output' && 'raw' in data ? data.raw : data;
          if (raw === 'SYNTHETIC_CHILD_STARTED' && Array.from(document.querySelectorAll<HTMLIFrameElement>('iframe[title="Learner execution compartment"]')).some(frame => frame.contentWindow === event.source)) childStartObserved = true;
        };
        window.addEventListener('message', observe);
        try { return { result: await window.__risk.run(source, candidate), childStartObserved }; }
        finally { window.removeEventListener('message', observe); }
      }, { source, candidate });
      const { result, childStartObserved } = observed;
      const nestedUnavailable = result.status === 'success' && result.output.some(line => line.startsWith('NESTED_CONSTRUCTOR_DENIED:') || line === 'NESTED_BOOTSTRAP_DENIED');
      const childStartRejection = result.status === 'protocol-error' && childStartObserved;
      const fresh = await page.evaluate(() => window.__risk.run('console.log("fresh after nested child")', 'opaque'));
      const exactSourceRetained = await page.evaluate(expected => window.__risk.source() === expected, original);
      const row = { candidate, trial, result, nestedUnavailable, childStartObserved, childStartRejection, fresh, exactSourceRetained, childExplicitlyTerminatedByFixture: false, termination: 'runtime cleanup after observed child-first-message rejection; finite capability test is separate', physicalMobile: 'untested' };
      rows.push(row);
      await info.attach('nested-loop-' + candidate + '-' + trial, { body: JSON.stringify(row), contentType: 'application/json' });
      expect(nestedUnavailable || childStartRejection).toBe(true);
      expect(result.elapsed).toBeLessThan(3000);
      expect(exactSourceRetained).toBe(true);
      expect(fresh.status).toBe('success');
      expect(fresh.elapsed).toBeLessThan(1000);
      await expect(page.locator('iframe[title="Learner execution compartment"]')).toHaveCount(0);
    }
  }
  await info.attach('nested-loop-comparison', { body: JSON.stringify({ browser: browser.version(), rows, limitation: 'fixed child-first-message fixture; host rejects that untrusted message, never grants a privileged action. A missing/bootstrap-error message is not a child-start proof.', hardMemoryQuota: 'unverified' }), contentType: 'application/json' });
});
