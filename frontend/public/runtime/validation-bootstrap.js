'use strict';

(() => {
  const LIMITS = {
    source: 65536,
    definition: 16384,
    packet: 16384,
    cases: 10,
    caseMs: 2000,
    totalMs: 6000,
  };
  const bootstrapId = globalThis.location.hash.slice(1);
  const parentOrigin = new globalThis.URLSearchParams(
    globalThis.location.search,
  ).get('parentOrigin');
  const utf8 = new globalThis.TextEncoder();
  let port;
  let active;

  function finish(status, message = '') {
    if (!active) return;
    const check = active;
    active = undefined;
    globalThis.clearTimeout(check.timer);
    globalThis.clearTimeout(check.totalTimer);
    check.worker?.terminate();
    port.postMessage({
      type: 'validation-result',
      checkId: check.checkId,
      status,
      cases: check.results,
      message,
    });
  }

  function runNext() {
    const check = active;
    if (!check) return;
    if (check.index >= check.tests.length) {
      finish('completed');
      return;
    }
    const test = check.tests[check.index];
    let worker;
    try {
      worker = new globalThis.Worker('/runtime/validation-worker.js');
    } catch {
      finish('internal-error', 'Validation unavailable');
      return;
    }
    check.worker = worker;
    check.timer = globalThis.setTimeout(() => {
      if (active !== check) return;
      worker.terminate();
      check.results.push({ id: test.id, status: 'timeout', passed: false });
      check.index += 1;
      check.worker = undefined;
      runNext();
    }, LIMITS.caseMs);
    worker.onerror = () => {
      if (active !== check || check.worker !== worker) return;
      finish('internal-error', 'Validation unavailable');
    };
    worker.onmessage = ({ data }) => {
      if (active !== check || check.worker !== worker) return;
      if (
        typeof data !== 'string' ||
        utf8.encode(data).length > LIMITS.packet
      ) {
        finish('internal-error', 'Invalid validation result');
        return;
      }
      let packet;
      try {
        packet = JSON.parse(data);
      } catch {
        finish('internal-error', 'Invalid validation result');
        return;
      }
      if (
        !packet ||
        packet.type !== 'case-result' ||
        packet.checkId !== check.checkId ||
        packet.caseId !== test.id ||
        typeof packet.passed !== 'boolean' ||
        ![
          'completed',
          'syntax-error',
          'runtime-error',
          'output-limit',
        ].includes(packet.status) ||
        (packet.status !== 'completed' && packet.passed)
      ) {
        finish('internal-error', 'Invalid validation result');
        return;
      }
      globalThis.clearTimeout(check.timer);
      worker.terminate();
      check.worker = undefined;
      check.results.push({
        id: test.id,
        status: packet.status,
        passed: packet.passed,
      });
      check.index += 1;
      runNext();
    };
    worker.postMessage({ checkId: check.checkId, source: check.source, test });
  }

  function start(command) {
    if (active) finish('cancelled', 'Validation cancelled');
    if (
      typeof command.checkId !== 'string' ||
      typeof command.source !== 'string' ||
      utf8.encode(command.source).length > LIMITS.source ||
      !Array.isArray(command.tests) ||
      command.tests.length < 1 ||
      command.tests.length > LIMITS.cases ||
      utf8.encode(JSON.stringify(command.tests)).length > LIMITS.definition
    )
      return;
    active = {
      checkId: command.checkId,
      source: command.source,
      tests: command.tests,
      index: 0,
      results: [],
      worker: undefined,
      timer: undefined,
      totalTimer: globalThis.setTimeout(
        () => finish('timeout', 'Validation timed out'),
        LIMITS.totalMs,
      ),
    };
    runNext();
  }

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
      if (data.type === 'validate') start(data);
      if (data.type === 'cancel' && active?.checkId === data.checkId)
        finish('cancelled', 'Validation cancelled');
      if (data.type === 'dispose') {
        if (active) finish('cancelled');
        port.close();
      }
    };
    port.start();
    port.postMessage({ type: 'connected' });
  });
  if (parentOrigin && bootstrapId)
    globalThis.parent.postMessage(
      { type: 'bootstrap-ready', bootstrapId },
      parentOrigin,
    );
})();
