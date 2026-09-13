const trustedParent = parent;
let started = false;
addEventListener('message', event => {
  if (started || event.source !== trustedParent || event.origin !== 'http://127.0.0.1:4310' || typeof event.data !== 'string' || new TextEncoder().encode(event.data).length > 65536) return;
  started = true;
  const frame = document.createElement('iframe');
  frame.title = 'Synthetic learner document';
  frame.setAttribute('sandbox', 'allow-scripts');
  const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
  frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="${policy}">${event.data}`;
  document.body.append(frame);
});
trustedParent.postMessage('preview-ready', 'http://127.0.0.1:4310');
