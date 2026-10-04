'use strict';

(() => {
  const script = globalThis.document.currentScript;
  if (!script) return;
  const previewOrigin = new globalThis.URL(script.src).origin;
  const nonce = script.dataset.nonce;
  const generationId = script.dataset.generation;
  if (!nonce || !generationId) return;
  const encoder = new globalThis.TextEncoder();
  const bytes = (value) => encoder.encode(value).byteLength;
  const safeText = (value) =>
    value.length <= 256 &&
    !value.includes('<') &&
    !value.includes('>') &&
    [...value].every((character) => (character.codePointAt(0) ?? 0) >= 32);
  const STYLE_VALUES = {
    color: /^(?:#[a-fA-F0-9]{3,8}|[a-zA-Z]{1,24})$/,
    backgroundColor: /^(?:#[a-fA-F0-9]{3,8}|[a-zA-Z]{1,24})$/,
    display: /^(?:none|block|inline|inline-block|flex|grid)$/,
    fontSize: /^(?:[0-9]{1,3}(?:px|rem|em|%))$/,
  };
  let eventSequence = 0;

  function elementFor(nodeId) {
    if (typeof nodeId !== 'string' || !/^n\d{1,3}$/.test(nodeId)) return null;
    return globalThis.document.querySelector(`[data-cq-node="${nodeId}"]`);
  }

  function validMutation(mutation) {
    const element = elementFor(mutation.nodeId);
    if (!element || typeof mutation.value !== 'string') return false;
    if (mutation.kind === 'text' && bytes(mutation.value) <= 4096) {
      return true;
    }
    if (
      mutation.kind === 'class' &&
      bytes(mutation.value) <= 1024 &&
      /^[a-zA-Z0-9_\s-]*$/.test(mutation.value)
    ) {
      return true;
    }
    if (
      mutation.kind === 'value' &&
      element.tagName === 'INPUT' &&
      bytes(mutation.value) <= 256
    ) {
      return true;
    }
    if (
      mutation.kind === 'attribute' &&
      ['title', 'aria-label'].includes(mutation.name) &&
      safeText(mutation.value)
    ) {
      return true;
    }
    if (
      mutation.kind === 'style' &&
      Object.hasOwn(STYLE_VALUES, mutation.name) &&
      STYLE_VALUES[mutation.name].test(mutation.value)
    ) {
      return true;
    }
    return false;
  }

  function apply(mutation) {
    const element = elementFor(mutation.nodeId);
    if (!element) return;
    if (mutation.kind === 'text') element.textContent = mutation.value;
    if (mutation.kind === 'class') element.className = mutation.value;
    if (mutation.kind === 'value') element.value = mutation.value;
    if (mutation.kind === 'attribute')
      element.setAttribute(mutation.name, mutation.value);
    if (mutation.kind === 'style')
      element.style[mutation.name] = mutation.value;
  }

  globalThis.addEventListener('message', (event) => {
    if (
      event.source !== globalThis.parent ||
      event.origin !== previewOrigin ||
      event.data?.type !== 'mutate' ||
      event.data.nonce !== nonce ||
      event.data.generationId !== generationId ||
      typeof event.data.stepId !== 'string' ||
      !Array.isArray(event.data.mutations) ||
      event.data.mutations.length > 256 ||
      bytes(JSON.stringify(event.data)) > 16384
    )
      return;
    if (!event.data.mutations.every(validMutation)) return;
    for (const mutation of event.data.mutations) apply(mutation);
    globalThis.parent.postMessage(
      {
        type: 'applied',
        nonce,
        generationId,
        stepId: event.data.stepId,
      },
      previewOrigin,
    );
  });

  for (const eventType of ['click', 'input', 'change']) {
    globalThis.document.addEventListener(eventType, (event) => {
      const element = event.target?.closest?.('[data-cq-node]');
      if (!element) return;
      if (eventType === 'click' && element.tagName === 'A')
        event.preventDefault();
      const targetId = element.getAttribute('data-cq-node');
      const value =
        element.tagName === 'INPUT' &&
        (eventType === 'input' || eventType === 'change')
          ? element.value.slice(0, 256)
          : undefined;
      globalThis.parent.postMessage(
        {
          type: 'interaction',
          nonce,
          generationId,
          sequence: ++eventSequence,
          targetId,
          eventType,
          value,
        },
        previewOrigin,
      );
    });
  }

  globalThis.parent.postMessage(
    { type: 'bridge-ready', nonce, generationId },
    previewOrigin,
  );
})();
