'use strict';

(() => {
  const LIMITS = { source: 65536, packet: 16384, deadline: 2000 };
  const bootstrapId = globalThis.location.hash.slice(1);
  const parentOrigin = new globalThis.URLSearchParams(
    globalThis.location.search,
  ).get('parentOrigin');
  const utf8 = new globalThis.TextEncoder();
  let port;
  let active;

  const terminate = (status, message) => {
    if (!active) return;
    const current = active;
    active = undefined;
    globalThis.clearTimeout(current.timer);
    current.worker.terminate();
    port.postMessage({
      type: 'result',
      runId: current.runId,
      status,
      output: [],
      value: '',
      message,
    });
  };

  const forward = (raw) => {
    if (
      !active ||
      typeof raw !== 'string' ||
      utf8.encode(raw).length > LIMITS.packet
    ) {
      terminate('internal-error', 'Runtime returned an invalid result');
      return;
    }
    let packet;
    try {
      packet = JSON.parse(raw);
    } catch {
      terminate('internal-error', 'Runtime returned an invalid result');
      return;
    }
    if (!packet || packet.type !== 'result' || packet.runId !== active.runId)
      return;
    const current = active;
    active = undefined;
    globalThis.clearTimeout(current.timer);
    current.worker.terminate();
    port.postMessage(packet);
  };

  const execute = (command) => {
    if (
      typeof command.runId !== 'string' ||
      typeof command.source !== 'string' ||
      utf8.encode(command.source).length > LIMITS.source
    ) {
      return;
    }
    if (active) terminate('cancelled', 'Execution cancelled');
    let worker;
    try {
      worker = new globalThis.Worker('/runtime/javascript-worker.js');
    } catch {
      port.postMessage({
        type: 'result',
        runId: command.runId,
        status: 'internal-error',
        output: [],
        value: '',
        message: 'Runtime unavailable',
      });
      return;
    }
    active = {
      runId: command.runId,
      worker,
      timer: globalThis.setTimeout(
        () => terminate('timeout', 'Execution timed out'),
        LIMITS.deadline,
      ),
    };
    worker.onmessage = (event) => forward(event.data);
    worker.onerror = () => terminate('internal-error', 'Runtime unavailable');
    worker.postMessage({ runId: command.runId, source: command.source });
  };

  globalThis.addEventListener('message', (event) => {
    if (
      port ||
      event.source !== globalThis.parent ||
      event.origin !== parentOrigin ||
      !event.data ||
      event.data.type !== 'connect' ||
      event.data.bootstrapId !== bootstrapId ||
      event.ports.length !== 1
    )
      return;
    port = event.ports[0];
    port.onmessage = ({ data }) => {
      if (!data || typeof data.type !== 'string') return;
      if (data.type === 'execute') execute(data);
      if (data.type === 'cancel' && active?.runId === data.runId)
        terminate('cancelled', 'Execution cancelled');
      if (data.type === 'dispose') {
        if (active) terminate('cancelled', 'Execution cancelled');
        port.close();
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
