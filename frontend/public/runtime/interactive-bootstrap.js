'use strict';

(() => {
  const LIMITS = {
    source: 65536,
    inputPacket: 220000,
    outputPacket: 16384,
    events: 64,
    mutations: 256,
    mutationBytes: 131072,
    deadline: 2000,
    session: 300000,
  };
  const bootstrapId = globalThis.location.hash.slice(1);
  const parentOrigin = new globalThis.URLSearchParams(
    globalThis.location.search,
  ).get('parentOrigin');
  const encoder = new globalThis.TextEncoder();
  const bytes = (value) => encoder.encode(value).byteLength;
  let port;
  let active;

  function release() {
    if (!active) return null;
    const previous = active;
    active = undefined;
    globalThis.clearTimeout(previous.stepTimer);
    globalThis.clearTimeout(previous.sessionTimer);
    previous.worker.terminate();
    return previous;
  }

  function fail(status, message) {
    const previous = release();
    if (!previous || !port) return;
    port.postMessage({
      type: 'step',
      sessionId: previous.sessionId,
      stepId: previous.stepId,
      status,
      message,
      output: [],
      mutations: [],
    });
  }

  function validMutation(mutation) {
    if (
      !mutation ||
      typeof mutation !== 'object' ||
      Array.isArray(mutation) ||
      typeof mutation.nodeId !== 'string' ||
      !/^n\d{1,3}$/.test(mutation.nodeId) ||
      typeof mutation.value !== 'string' ||
      !['text', 'class', 'style', 'attribute', 'value'].includes(mutation.kind)
    )
      return false;
    if (mutation.kind === 'style') {
      return ['color', 'backgroundColor', 'display', 'fontSize'].includes(
        mutation.name,
      );
    }
    if (mutation.kind === 'attribute') {
      return ['title', 'aria-label'].includes(mutation.name);
    }
    return mutation.name === undefined;
  }

  function forward(raw) {
    if (
      !active ||
      typeof raw !== 'string' ||
      bytes(raw) > LIMITS.outputPacket
    ) {
      fail('internal-error', 'Interactive runner returned an invalid result');
      return;
    }
    let packet;
    try {
      packet = JSON.parse(raw);
    } catch {
      fail('internal-error', 'Interactive runner returned an invalid result');
      return;
    }
    if (
      !packet ||
      packet.type !== 'step' ||
      packet.sessionId !== active.sessionId ||
      packet.stepId !== active.stepId ||
      ![
        'ready',
        'syntax-error',
        'runtime-error',
        'unsupported',
        'output-limit',
      ].includes(packet.status) ||
      typeof packet.message !== 'string' ||
      bytes(packet.message) > 1024 ||
      !Array.isArray(packet.output) ||
      packet.output.length > 200 ||
      !packet.output.every((line) => typeof line === 'string') ||
      bytes(packet.output.join('')) > 12288 ||
      !Array.isArray(packet.mutations) ||
      !packet.mutations.every(validMutation) ||
      active.mutationCount + packet.mutations.length > LIMITS.mutations
    ) {
      fail('internal-error', 'Interactive runner returned an invalid result');
      return;
    }
    const emittedBytes = bytes(JSON.stringify(packet.mutations));
    if (active.mutationBytes + emittedBytes > LIMITS.mutationBytes) {
      fail('output-limit', 'Interactive mutation limit exceeded');
      return;
    }
    globalThis.clearTimeout(active.stepTimer);
    active.stepTimer = undefined;
    if (packet.status !== 'ready') {
      release();
      port.postMessage({ ...packet, mutations: [] });
      return;
    }
    active.mutationCount += packet.mutations.length;
    active.mutationBytes += emittedBytes;
    port.postMessage(packet);
  }

  function beginStep(stepId) {
    if (
      !active ||
      active.stepTimer ||
      typeof stepId !== 'string' ||
      stepId.length > 64
    )
      return false;
    active.stepId = stepId;
    active.stepTimer = globalThis.setTimeout(
      () => fail('timeout', 'Interactive execution timed out'),
      LIMITS.deadline,
    );
    return true;
  }

  function start(command) {
    if (
      typeof command.sessionId !== 'string' ||
      command.sessionId.length > 64 ||
      typeof command.stepId !== 'string' ||
      command.stepId.length > 64 ||
      typeof command.source !== 'string' ||
      bytes(command.source) > LIMITS.source ||
      !Array.isArray(command.nodes) ||
      command.nodes.length > 512
    )
      return;
    let size;
    try {
      size = bytes(JSON.stringify(command));
    } catch {
      return;
    }
    if (size > LIMITS.inputPacket) return;
    if (active) fail('cancelled', 'Interactive session replaced');
    let worker;
    try {
      worker = new globalThis.Worker('/runtime/interactive-worker.js');
    } catch {
      port.postMessage({
        type: 'step',
        sessionId: command.sessionId,
        stepId: command.stepId,
        status: 'unavailable',
        message: 'Interactive runner unavailable',
        output: [],
        mutations: [],
      });
      return;
    }
    active = {
      sessionId: command.sessionId,
      stepId: command.stepId,
      worker,
      stepTimer: undefined,
      sessionTimer: globalThis.setTimeout(() => {
        const previous = release();
        if (previous && port)
          port.postMessage({
            type: 'session-ended',
            sessionId: previous.sessionId,
            status: 'cancelled',
            message: 'Interactive session expired',
          });
      }, LIMITS.session),
      eventCount: 0,
      mutationCount: 0,
      mutationBytes: 0,
    };
    worker.onmessage = (event) => forward(event.data);
    worker.onerror = () =>
      fail('internal-error', 'Interactive runner unavailable');
    beginStep(command.stepId);
    worker.postMessage({
      type: 'start',
      sessionId: command.sessionId,
      stepId: command.stepId,
      source: command.source,
      nodes: command.nodes,
    });
  }

  function dispatch(command) {
    if (
      !active ||
      command.sessionId !== active.sessionId ||
      active.stepTimer ||
      active.eventCount >= LIMITS.events ||
      !command.event ||
      !['click', 'input', 'change'].includes(command.event.type) ||
      typeof command.event.targetId !== 'string' ||
      !/^n\d{1,3}$/.test(command.event.targetId) ||
      (command.event.value !== undefined &&
        (typeof command.event.value !== 'string' ||
          bytes(command.event.value) > 256))
    )
      return;
    if (!beginStep(command.stepId)) return;
    active.eventCount += 1;
    active.worker.postMessage({
      type: 'event',
      sessionId: active.sessionId,
      stepId: command.stepId,
      event: command.event,
    });
  }

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
      if (data.type === 'start') start(data);
      if (data.type === 'event') dispatch(data);
      if (data.type === 'cancel' && active?.sessionId === data.sessionId)
        fail('cancelled', 'Interactive session cancelled');
      if (data.type === 'dispose') {
        release();
        port.close();
        port = undefined;
      }
    };
    port.start();
    port.postMessage({ type: 'connected' });
  });

  if (parentOrigin && bootstrapId) {
    globalThis.parent.postMessage(
      { type: 'bootstrap-ready', bootstrapId },
      parentOrigin,
    );
  }
})();
