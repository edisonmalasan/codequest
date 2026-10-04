'use strict';

(() => {
  const MAX_PACKET_BYTES = 147456;
  const bootstrapId = globalThis.location.hash.slice(1);
  const parentOrigin = new globalThis.URLSearchParams(
    globalThis.location.search,
  ).get('parentOrigin');
  const previewOrigin = globalThis.location.origin;
  const encoder = new globalThis.TextEncoder();
  const bytes = (value) => encoder.encode(value).byteLength;
  let port;
  let child;
  let childNonce;
  let activeGeneration;
  let allowedNodes = new Set();

  function clearChild() {
    if (child) {
      child.onload = null;
      child.onerror = null;
      child.remove();
      child = undefined;
    }
    childNonce = undefined;
    activeGeneration = undefined;
    allowedNodes = new Set();
  }

  function report(type, generationId, stepId) {
    if (!port) return;
    const packet = { type, generationId };
    if (stepId) packet.stepId = stepId;
    port.postMessage(packet);
  }

  function render(packet) {
    if (
      Object.keys(packet).length !== 5 ||
      typeof packet.generationId !== 'string' ||
      packet.generationId.length > 64 ||
      typeof packet.body !== 'string' ||
      typeof packet.css !== 'string' ||
      !Array.isArray(packet.nodeIds) ||
      packet.nodeIds.length > 512 ||
      !packet.nodeIds.every(
        (id) => typeof id === 'string' && /^n\d{1,3}$/.test(id),
      ) ||
      bytes(packet.body) + bytes(packet.css) > 131072
    ) {
      clearChild();
      report('invalid', packet.generationId);
      return;
    }
    clearChild();
    activeGeneration = packet.generationId;
    allowedNodes = new Set(packet.nodeIds);
    childNonce = globalThis.crypto.randomUUID();
    const nonce = childNonce;
    const policy = [
      "default-src 'none'",
      `script-src 'nonce-${nonce}'`,
      "style-src 'unsafe-inline'",
      'img-src data:',
      "connect-src 'none'",
      "frame-src 'none'",
      "worker-src 'none'",
      "object-src 'none'",
      "form-action 'none'",
      "base-uri 'none'",
    ].join('; ');
    const frame = globalThis.document.createElement('iframe');
    frame.title = 'Interactive learner page';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.referrerPolicy = 'no-referrer';
    frame.style.cssText =
      'display:block;width:100%;height:100%;border:0;background:white';
    frame.onerror = () => {
      if (child === frame && childNonce === nonce)
        report('error', packet.generationId);
    };
    const doc = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer"><style>${packet.css}</style></head><body>${packet.body}<script nonce="${nonce}" src="/preview/interactive-bridge.js" data-generation="${packet.generationId}" data-nonce="${nonce}"></script></body></html>`;
    if (bytes(doc) > 131072) {
      clearChild();
      report('invalid', packet.generationId);
      return;
    }
    child = frame;
    frame.srcdoc = doc;
    globalThis.document.body.append(frame);
  }

  function validMutation(mutation) {
    if (
      !mutation ||
      typeof mutation !== 'object' ||
      Array.isArray(mutation) ||
      !allowedNodes.has(mutation.nodeId) ||
      typeof mutation.value !== 'string' ||
      !['text', 'class', 'style', 'attribute', 'value'].includes(mutation.kind)
    )
      return false;
    if (mutation.kind === 'style')
      return ['color', 'backgroundColor', 'display', 'fontSize'].includes(
        mutation.name,
      );
    if (mutation.kind === 'attribute')
      return ['title', 'aria-label'].includes(mutation.name);
    return mutation.name === undefined;
  }

  function mutate(packet) {
    if (
      !child ||
      packet.generationId !== activeGeneration ||
      typeof packet.stepId !== 'string' ||
      packet.stepId.length > 64 ||
      !Array.isArray(packet.mutations) ||
      packet.mutations.length > 256 ||
      !packet.mutations.every(validMutation) ||
      bytes(JSON.stringify(packet)) > 16384
    ) {
      report('invalid', packet.generationId, packet.stepId);
      return;
    }
    child.contentWindow?.postMessage(
      {
        type: 'mutate',
        nonce: childNonce,
        generationId: activeGeneration,
        stepId: packet.stepId,
        mutations: packet.mutations,
      },
      '*',
    );
  }

  globalThis.addEventListener('message', (event) => {
    if (
      !child ||
      event.source !== child.contentWindow ||
      event.origin !== 'null' ||
      !event.data ||
      typeof event.data !== 'object' ||
      Array.isArray(event.data) ||
      event.data.nonce !== childNonce ||
      event.data.generationId !== activeGeneration
    )
      return;
    const data = event.data;
    if (data.type === 'bridge-ready' && Object.keys(data).length === 3) {
      report('rendered', activeGeneration);
    } else if (
      data.type === 'interaction' &&
      Object.keys(data).length === 6 &&
      allowedNodes.has(data.targetId) &&
      ['click', 'input', 'change'].includes(data.eventType) &&
      (data.value === undefined ||
        (typeof data.value === 'string' && bytes(data.value) <= 256)) &&
      bytes(JSON.stringify(data)) <= 1024
    ) {
      port?.postMessage({
        type: 'interaction',
        generationId: activeGeneration,
        eventId: globalThis.crypto.randomUUID(),
        event: {
          type: data.eventType,
          targetId: data.targetId,
          ...(data.value === undefined ? {} : { value: data.value }),
        },
      });
    } else if (
      data.type === 'applied' &&
      Object.keys(data).length === 4 &&
      typeof data.stepId === 'string' &&
      data.stepId.length <= 64
    ) {
      report('applied', activeGeneration, data.stepId);
    }
  });

  globalThis.addEventListener('message', (event) => {
    if (
      port ||
      event.source !== globalThis.parent ||
      event.origin !== parentOrigin ||
      event.data?.type !== 'connect' ||
      event.data.bootstrapId !== bootstrapId ||
      event.ports.length !== 1
    )
      return;
    port = event.ports[0];
    port.onmessage = ({ data }) => {
      if (!data || typeof data.type !== 'string') return;
      let size;
      try {
        size = bytes(JSON.stringify(data));
      } catch {
        return;
      }
      if (size > MAX_PACKET_BYTES) {
        clearChild();
        report('invalid', data.generationId);
        return;
      }
      if (data.type === 'render') render(data);
      if (data.type === 'mutate') mutate(data);
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
