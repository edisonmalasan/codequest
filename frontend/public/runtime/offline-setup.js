(() => {
  const parentOrigin = new globalThis.URL(
    globalThis.location.href,
  ).searchParams.get('parentOrigin');
  const setupId = globalThis.location.hash.slice(1);
  if (!parentOrigin || !setupId || setupId.length > 128) return;
  try {
    if (new globalThis.URL(parentOrigin).origin !== parentOrigin) return;
  } catch {
    return;
  }
  const respond = (status) => {
    globalThis.parent.postMessage(
      { type: 'offline-runner-setup', setupId, status },
      parentOrigin,
    );
  };
  if (
    !('serviceWorker' in globalThis.navigator) ||
    !globalThis.navigator.onLine
  ) {
    respond('unavailable');
    return;
  }
  globalThis.navigator.serviceWorker
    .register('/runtime/offline-sw.js', {
      scope: '/runtime/',
      updateViaCache: 'none',
    })
    .then(async () => {
      const ready = await globalThis.navigator.serviceWorker.ready;
      const worker = ready.active;
      if (!worker) throw new Error('Runtime worker inactive');
      if (worker.state !== 'activated')
        await new Promise((resolve, reject) => {
          const timer = globalThis.setTimeout(
            () => reject(new Error('Runtime worker inactive')),
            10000,
          );
          worker.addEventListener('statechange', () => {
            if (worker.state === 'activated') {
              globalThis.clearTimeout(timer);
              resolve();
            } else if (worker.state === 'redundant') {
              globalThis.clearTimeout(timer);
              reject(new Error('Runtime worker redundant'));
            }
          });
        });
      const cache = await globalThis.caches.open('codequest-runtime-1');
      if ((await cache.keys()).length !== 6)
        throw new Error('Runtime cache incomplete');
      const resources = [
        [
          'bootstrap.html',
          '73f245927ad20fbcfba9157eed219eb6266cc6bb2cc9421efbb4ba81c6064722',
        ],
        [
          'bootstrap.js',
          'c1ca5d11af09d685bdedb119b36831e0d82b0d4b4a04f34cf3fd40dadc589679',
        ],
        [
          'javascript-worker.js',
          'c108eee0687ed5742d98fe7b24739ddf699fed5f4075fa4dfa8f49a522804d8d',
        ],
        [
          'validation-bootstrap.html',
          '44f2ad6d51aeef66298d4df6d3f950b2fccc7e4fe5769d9b2b74d430e5ce90b3',
        ],
        [
          'validation-bootstrap.js',
          '0cb515ee499ff4ebce919173276421ce1056586d3d291820a92d743e05e1bfe7',
        ],
        [
          'validation-worker.js',
          'a9bb0da49a93d64158eef89dc80995aa3be22a1ed37e4cd671cb5539dbd8c959',
        ],
      ];
      for (const [file, expected] of resources) {
        const cached = await cache.match(`/runtime/${file}`);
        if (!cached) throw new Error('Runtime cache incomplete');
        const bytes = await cached.arrayBuffer();
        const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
        const hash = Array.from(new Uint8Array(digest), (byte) =>
          byte.toString(16).padStart(2, '0'),
        ).join('');
        const policy = file.endsWith('-worker.js')
          ? "default-src 'none'; script-src 'unsafe-eval'; worker-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'"
          : "default-src 'none'; script-src 'self'; worker-src 'self'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
        if (
          !cached.ok ||
          bytes.byteLength > 64 * 1024 ||
          hash !== expected ||
          cached.headers.get('content-security-policy') !== policy
        )
          throw new Error('Runtime cache mismatch');
      }
      respond('ready');
    })
    .catch(() => respond('unavailable'));
})();
