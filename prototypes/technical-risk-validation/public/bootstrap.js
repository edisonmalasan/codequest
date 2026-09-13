const trustedParent = parent;
let worker;
window.addEventListener('message', (event) => {
  if (event.source !== trustedParent || !event.data || event.data.type !== 'start') return;
  if (worker) return;
  worker = new Worker('/worker.js');
  worker.onmessage = (message) => trustedParent.postMessage(message.data, '*');
  worker.onerror = () => trustedParent.postMessage('bootstrap-error', '*');
  worker.postMessage(event.data.input);
});
trustedParent.postMessage('ready', '*');
