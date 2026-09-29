/* Fixed, credential-free resources for the dedicated CodeQuest runner origin. */
const RESOURCES = new Map([
  [
    '/runtime/bootstrap.html',
    '73f245927ad20fbcfba9157eed219eb6266cc6bb2cc9421efbb4ba81c6064722',
  ],
  [
    '/runtime/bootstrap.js',
    'c1ca5d11af09d685bdedb119b36831e0d82b0d4b4a04f34cf3fd40dadc589679',
  ],
  [
    '/runtime/javascript-worker.js',
    'c108eee0687ed5742d98fe7b24739ddf699fed5f4075fa4dfa8f49a522804d8d',
  ],
  [
    '/runtime/validation-bootstrap.html',
    '44f2ad6d51aeef66298d4df6d3f950b2fccc7e4fe5769d9b2b74d430e5ce90b3',
  ],
  [
    '/runtime/validation-bootstrap.js',
    '0cb515ee499ff4ebce919173276421ce1056586d3d291820a92d743e05e1bfe7',
  ],
  [
    '/runtime/validation-worker.js',
    'a9bb0da49a93d64158eef89dc80995aa3be22a1ed37e4cd671cb5539dbd8c959',
  ],
]);
const CACHE_NAME = 'codequest-runtime-1';
const CACHE_PREFIX = 'codequest-runtime-';
const MAX_ENTRY_BYTES = 64 * 1024;
const MAX_TOTAL_BYTES = 256 * 1024;

function expectedPolicy(path) {
  return path.endsWith('-worker.js')
    ? "default-src 'none'; script-src 'unsafe-eval'; worker-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'"
    : "default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
}

async function digest(bytes) {
  const value = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(value), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

function validHeaders(response, path) {
  const mime = response.headers.get('content-type') || '';
  return (
    response.ok &&
    !response.redirected &&
    !response.headers.has('set-cookie') &&
    (path.endsWith('.html')
      ? /^text\/html(?:;|$)/i.test(mime)
      : /^(?:application|text)\/javascript(?:;|$)/i.test(mime)) &&
    response.headers.get('content-security-policy') === expectedPolicy(path)
  );
}

globalThis.self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await globalThis.caches.open(CACHE_NAME);
      let total = 0;
      try {
        for (const [path, expected] of RESOURCES) {
          const response = await globalThis.fetch(
            new globalThis.Request(path, {
              credentials: 'omit',
              cache: 'no-store',
              redirect: 'error',
            }),
          );
          if (!validHeaders(response, path))
            throw new Error('Runtime resource unavailable');
          const bytes = await response.clone().arrayBuffer();
          total += bytes.byteLength;
          if (
            bytes.byteLength === 0 ||
            bytes.byteLength > MAX_ENTRY_BYTES ||
            total > MAX_TOTAL_BYTES ||
            (await digest(bytes)) !== expected
          )
            throw new Error('Runtime resource mismatch');
          await cache.put(path, response);
        }
      } catch (error) {
        await globalThis.caches.delete(CACHE_NAME);
        throw error;
      }
    })(),
  );
});

globalThis.self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await globalThis.caches.keys()) {
        if (name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
          await globalThis.caches.delete(name);
      }
      await globalThis.self.clients.claim();
    })(),
  );
});

globalThis.self.addEventListener('fetch', (event) => {
  const url = new globalThis.URL(event.request.url);
  if (
    url.origin !== globalThis.self.location.origin ||
    event.request.method !== 'GET'
  )
    return;
  if (event.request.headers.has('authorization')) return;
  if (!RESOURCES.has(url.pathname)) return;
  if (
    url.search &&
    (!url.pathname.endsWith('bootstrap.html') ||
      url.searchParams.size !== 1 ||
      !url.searchParams.has('parentOrigin'))
  )
    return;
  event.respondWith(
    (async () => {
      try {
        const network = await globalThis.fetch(
          new globalThis.Request(url.pathname, {
            credentials: 'omit',
            cache: 'no-store',
            redirect: 'error',
          }),
        );
        const bytes = await network.clone().arrayBuffer();
        if (
          validHeaders(network, url.pathname) &&
          bytes.byteLength <= MAX_ENTRY_BYTES &&
          (await digest(bytes)) === RESOURCES.get(url.pathname)
        )
          return network;
      } catch {
        // Only the pinned public resource below can satisfy an offline request.
      }
      const cached = await (
        await globalThis.caches.open(CACHE_NAME)
      ).match(url.pathname);
      if (!cached) return globalThis.Response.error();
      const bytes = await cached.clone().arrayBuffer();
      if (
        bytes.byteLength > MAX_ENTRY_BYTES ||
        !validHeaders(cached, url.pathname) ||
        (await digest(bytes)) !== RESOURCES.get(url.pathname)
      )
        return globalThis.Response.error();
      return cached;
    })(),
  );
});
