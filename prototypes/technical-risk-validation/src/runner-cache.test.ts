import { readFileSync } from 'node:fs';
import { createHash, webcrypto } from 'node:crypto';
import { runInNewContext } from 'node:vm';
import { expect, test } from 'vitest';

const policy = "default-src 'none'; script-src 'unsafe-eval'; connect-src 'none'; worker-src 'none'";
const bytes = 'fixed public Worker bytes';

async function cachedResponse(response: Response): Promise<Response> {
  let fetchHandler: ((event: { request: Request; respondWith: (response: Promise<Response>) => void }) => void) | undefined;
  const script = readFileSync(new URL('../public/runner-sw.js', import.meta.url), 'utf8').replace('const publicHashes = /* trusted-public-manifest */ {};', 'const publicHashes = ' + JSON.stringify({ '/worker.js': createHash('sha256').update(bytes).digest('hex') }) + ';');
  runInNewContext(script, {
    crypto: webcrypto, URL, Response, location: { origin: 'http://127.0.0.2:4311' },
    caches: { open: async () => ({ match: async () => response }) },
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
