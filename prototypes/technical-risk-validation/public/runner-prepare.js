// Public cache preparation only. Never construct a Worker or execution bootstrap.
async function prepare() {
  try {
    await navigator.serviceWorker.register('/runner-sw.js');
    await navigator.serviceWorker.ready;
    parent.postMessage({ type: 'runner-resources-prepared', id: location.hash.slice(1) }, '*');
  } catch {
    parent.postMessage({ type: 'runner-resources-unavailable', id: location.hash.slice(1) }, '*');
  }
}
void prepare();
