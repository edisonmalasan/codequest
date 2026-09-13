// Trusted diagnostic only: fixed response, no application or learner data.
let fetchCount = 0;
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  fetchCount++;
  event.respondWith(Promise.resolve(new Response('<h1>SYNTHETIC_SW_RESPONSE</h1>', {
    headers: { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' },
  })));
});
self.addEventListener('message', event => {
  event.ports[0]?.postMessage({ fetchCount, workerOnline: self.navigator.onLine });
});
