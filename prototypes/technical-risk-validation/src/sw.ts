import { Serwist, type PrecacheEntry } from 'serwist';

declare global { interface WorkerGlobalScope { __SW_MANIFEST: (PrecacheEntry | string)[] | undefined } }
// Only build-time public resources are precached. No runtime/API response cache.
const serwist = new Serwist({ precacheEntries: self.__SW_MANIFEST, skipWaiting: false, clientsClaim: true });
serwist.addEventListeners();
