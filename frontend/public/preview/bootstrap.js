'use strict';

(() => {
  const MAX_PACKET_BYTES = 147456;
  const bootstrapId = globalThis.location.hash.slice(1);
  const parentOrigin = new globalThis.URLSearchParams(
    globalThis.location.search,
  ).get('parentOrigin');
  const encoder = new globalThis.TextEncoder();
  let port;
  let child;
  let activeGeneration;

  const clearChild = () => {
    if (child) {
      child.onload = null;
      child.onerror = null;
      child.remove();
      child = undefined;
    }
    activeGeneration = undefined;
  };

  const report = (type, generationId) => {
    port?.postMessage({ type, generationId });
  };

  const render = (packet) => {
    if (
      Object.keys(packet).length !== 3 ||
      typeof packet.generationId !== 'string' ||
      packet.generationId.length > 64 ||
      typeof packet.document !== 'string' ||
      encoder.encode(packet.document).length > 131072
    ) {
      report('invalid', packet.generationId);
      clearChild();
      return;
    }
    clearChild();
    activeGeneration = packet.generationId;
    const frame = globalThis.document.createElement('iframe');
    frame.title = 'Static learner HTML and CSS preview';
    frame.setAttribute('sandbox', '');
    frame.style.cssText =
      'display:block;width:100%;height:100%;border:0;background:white';
    frame.onload = () => {
      if (child === frame && activeGeneration === packet.generationId) {
        report('ready', packet.generationId);
      }
    };
    frame.onerror = () => {
      if (child === frame && activeGeneration === packet.generationId) {
        report('error', packet.generationId);
      }
    };
    child = frame;
    frame.srcdoc = packet.document;
    globalThis.document.body.append(frame);
  };

  globalThis.addEventListener('message', (event) => {
    if (
      port ||
      event.source !== globalThis.parent ||
      event.origin !== parentOrigin ||
      event.data?.type !== 'connect' ||
      event.data.bootstrapId !== bootstrapId ||
      event.ports.length !== 1
    ) {
      return;
    }
    port = event.ports[0];
    port.onmessage = ({ data }) => {
      if (!data || typeof data.type !== 'string') return;
      if (data.type === 'render') {
        let bytes = MAX_PACKET_BYTES + 1;
        try {
          bytes = encoder.encode(JSON.stringify(data)).length;
        } catch {
          // A malformed packet is rejected below.
        }
        if (bytes > MAX_PACKET_BYTES) {
          clearChild();
          report('invalid', data.generationId);
          return;
        }
        render(data);
      }
      if (data.type === 'clear') clearChild();
      if (data.type === 'dispose') {
        clearChild();
        port.close();
        port = undefined;
      }
    };
    port.start();
    port.postMessage({ type: 'connected', bootstrapId });
  });

  if (parentOrigin && bootstrapId) {
    globalThis.parent.postMessage(
      { type: 'bootstrap-ready', bootstrapId },
      parentOrigin,
    );
  }
})();
