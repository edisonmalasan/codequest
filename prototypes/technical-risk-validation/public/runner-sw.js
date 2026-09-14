// Disposable runner public resources only. No commands, drafts or API responses.
const publicPaths = ['/bootstrap.html', '/bootstrap.js', '/worker.js', '/runner-prepare.html', '/runner-prepare.js'];
// Replaced by the fixture server before registration, pinned to fixed build bytes.
// Learner-origin Cache API access cannot change this installed trusted manifest.
const publicHashes = /* trusted-public-manifest */ {};
const publicResources = /* trusted-public-bytes */ {};
const publicCache = 'codequest-runner-public-v1';
const workerPolicy = "default-src 'none'; script-src 'unsafe-eval'; connect-src 'none'; worker-src 'none'";
const bootstrapPolicy = "default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'self'; frame-src 'none'; form-action 'none'; base-uri 'none'";
async function validPublicResponse(path, response) {
  if (!response || !response.ok || response.headers.get('Content-Security-Policy') !== (path === '/worker.js' ? workerPolicy : bootstrapPolicy)) return false;
  const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  return publicHashes[path] === hash;
}
addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(publicCache);
    for (const path of publicPaths) {
      const response = await fetch(path, { cache: 'no-store' });
      if (!await validPublicResponse(path, response)) throw new Error('Public runner resource policy unavailable');
      await cache.put(path, response);
    }
    await self.skipWaiting();
  })());
});
addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith('codequest-runner-public-') && name !== publicCache) await caches.delete(name);
    await self.clients.claim();
  })());
});
addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.search || !publicPaths.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(publicCache);
    let response = await cache.match(url.pathname);
    if (!await validPublicResponse(url.pathname, response)) {
      // Repair only from immutable bytes in this installed trusted script.
      // Never trust a poisoned response or fetch learner-selected resources.
      const resource = publicResources[url.pathname];
      if (!resource) return new Response('Public runner resource unavailable', { status: 503 });
      response = new Response(resource.body, { headers: resource.headers });
      if (!await validPublicResponse(url.pathname, response)) return new Response('Public runner resource unavailable', { status: 503 });
      await cache.put(url.pathname, response.clone());
    }
    return response;
  })());
});
