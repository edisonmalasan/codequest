import { readFileSync } from 'node:fs';
import { createHash, webcrypto } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { expect, test } from 'vitest';

const policy = "default-src 'none'; script-src 'unsafe-eval'; connect-src 'none'; worker-src 'none'";
const bytes = 'fixed public Worker bytes';

async function cachedResponse(response: Response, repair = false): Promise<Response> {
  let fetchHandler: ((event: { request: Request; respondWith: (response: Promise<Response>) => void }) => void) | undefined;
  const resource = { headers: { 'Content-Security-Policy': policy, 'Content-Type': 'text/javascript' }, ...(repair ? { body: bytes } : {}) };
  const script = readFileSync(new URL('../public/runner-sw.js', import.meta.url), 'utf8').replace('const publicHashes = /* trusted-public-manifest */ {};', 'const publicHashes = ' + JSON.stringify({ '/worker.js': createHash('sha256').update(bytes).digest('hex') }) + ';').replace('const publicResources = /* trusted-public-bytes */ {};', 'const publicResources = ' + JSON.stringify({ '/worker.js': resource }) + ';');
  runInNewContext(script, {
    crypto: webcrypto, URL, Response, location: { origin: 'http://127.0.0.2:4311' },
    caches: { open: async () => ({ match: async () => response, put: async () => {} }) },
    addEventListener: (type: string, handler: typeof fetchHandler) => { if (type === 'fetch') fetchHandler = handler; },
  });
  return new Promise<Response>((resolve, reject) => {
    if (!fetchHandler) { reject(new Error('Trusted fetch handler missing')); return; }
    fetchHandler({ request: new Request('http://127.0.0.2:4311/worker.js'), respondWith: promise => { void promise.then(resolve, reject); } });
  });
}

test('trusted runner cache serves only pinned public bytes with exact Worker CSP', async () => {
  const response = await cachedResponse(new Response(bytes, { headers: { 'Content-Security-Policy': policy } }));
  expect(response.status).toBe(200);
  expect(await response.text()).toBe(bytes);
  expect(response.headers.get('Content-Security-Policy')).toBe(policy);
});

test('learner cache body poisoning fails closed even with the expected CSP', async () => {
  expect((await cachedResponse(new Response('poison', { headers: { 'Content-Security-Policy': policy } }))).status).toBe(503);
});

test('learner CSP poisoning fails closed even with the expected public bytes', async () => {
  expect((await cachedResponse(new Response(bytes, { headers: { 'Content-Security-Policy': "default-src *" } }))).status).toBe(503);
});

test('trusted immutable resource bytes repair a poisoned cache without serving learner bytes', async () => {
  const response = await cachedResponse(new Response('poison'), true);
  expect(response.status).toBe(200);
  expect(await response.text()).toBe(bytes);
  expect(response.headers.get('Content-Security-Policy')).toBe(policy);
});

test('cached reporting and refresh headers cannot become trusted response authority', async () => {
  const response = await cachedResponse(new Response(bytes, { headers: { 'Content-Security-Policy': policy, 'Content-Security-Policy-Report-Only': "default-src 'none'; report-uri http://127.0.0.1:4312/report", Refresh: '0;url=http://127.0.0.1:4312/refresh' } }));
  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Security-Policy-Report-Only')).toBeNull();
  expect(response.headers.get('Refresh')).toBeNull();
});

test('oversized cached public body fails closed within the fixed byte guard', async () => {
  expect((await cachedResponse(new Response('x'.repeat(1048576), { headers: { 'Content-Security-Policy': policy } }))).status).toBe(503);
});
