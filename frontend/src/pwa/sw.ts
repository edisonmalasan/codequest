/// <reference lib="webworker" />
import { Serwist, type PrecacheEntry } from 'serwist';
import {
  canServeShell,
  canUseOfflineFallback,
  isPublicShellUrl,
} from './cache-policy';

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[];
};

// Serwist's constructor installs SKIP_WAITING even when skipWaiting is false.
// No client message is an approved cache/activation command in this phase.
self.addEventListener('message', (event) => event.stopImmediatePropagation());

const manifest = self.__SW_MANIFEST.filter((entry) =>
  isPublicShellUrl(typeof entry === 'string' ? entry : entry.url),
);
const serwist = new Serwist({
  cacheId: 'codequest-shell',
  precacheEntries: manifest,
  precacheOptions: {
    ignoreURLParametersMatching: [],
    cleanURLs: false,
    directoryIndex: undefined,
    fetchOptions: { credentials: 'omit', cache: 'no-store' },
  },
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: false,
});

// Deliberately omit Serwist's general CACHE_URLS / SKIP_WAITING message handlers.
self.addEventListener('install', (event) =>
  event.waitUntil(serwist.handleInstall(event)),
);
self.addEventListener('activate', (event) =>
  event.waitUntil(serwist.handleActivate(event)),
);
self.addEventListener('fetch', (event) => {
  if (canServeShell(event.request, self.location.origin)) {
    const response = serwist.handleRequest({ request: event.request, event });
    if (response) event.respondWith(response);
  } else if (canUseOfflineFallback(event.request, self.location.origin)) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(async () => {
        const fallback = await serwist.matchPrecache('/offline.html');
        return fallback ?? Response.error();
      }),
    );
  }
});
