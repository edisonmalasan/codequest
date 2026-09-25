'use strict';

const trustedSend = globalThis.postMessage.bind(globalThis);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const descriptors = Object.getOwnPropertyDescriptors.bind(Object);
const descriptorEntries = Object.entries.bind(Object);
const hasValue = Object.prototype.hasOwnProperty.call.bind(
  Object.prototype.hasOwnProperty,
);
const utf8 = new globalThis.TextEncoder();
const LIMITS = {
  entries: 200,
  output: 12288,
  error: 1024,
  depth: 8,
  width: 200,
  packet: 16384,
};
let started = false;

for (const name of [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'indexedDB',
  'caches',
  'BroadcastChannel',
  'Worker',
  'SharedWorker',
  'importScripts',
  'postMessage',
]) {
  try {
    Object.defineProperty(globalThis, name, {
      value: undefined,
      configurable: false,
      writable: false,
    });
  } catch {
    try {
      globalThis[name] = undefined;
    } catch {
      /* Non-configurable runtime capability remains governed by CSP. */
    }
  }
}

class OutputLimitError extends Error {}

function printable(value, depth = 0, seen = new Set()) {
  if (depth > LIMITS.depth)
    throw new OutputLimitError('Output is too deeply nested');
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  )
    return String(value);
  if (typeof value === 'string') {
    if (utf8.encode(value).length > LIMITS.output)
      throw new OutputLimitError('Output value is too large');
    return value;
  }
  if (typeof value === 'undefined') return 'undefined';
  if (typeof value === 'symbol') return '[symbol]';
  if (typeof value === 'function') return '[function]';
  if (seen.has(value)) throw new OutputLimitError('Output contains a cycle');
  seen.add(value);
  let entries;
  try {
    entries = descriptorEntries(descriptors(value));
  } catch {
    throw new OutputLimitError('Output value cannot be inspected');
  }
  if (entries.length > LIMITS.width)
    throw new OutputLimitError('Output object is too wide');
  return (
    '{' +
    entries
      .map(([key, property]) => {
        const item = hasValue(property, 'value')
          ? printable(property.value, depth + 1, seen)
          : '[accessor]';
        return `${key}:${item}`;
      })
      .join(',') +
    '}'
  );
}

globalThis.onmessage = async ({ data }) => {
  if (started) return;
  started = true;
  if (
    !data ||
    typeof data.runId !== 'string' ||
    typeof data.source !== 'string'
  )
    return;
  const output = [];
  let outputBytes = 0;
  let limitHit = false;
  const consoleCapture = {};
  for (const method of ['log', 'info', 'warn', 'error', 'debug']) {
    consoleCapture[method] = (...values) => {
      const text = values.map((value) => printable(value)).join(' ');
      outputBytes += utf8.encode(text).length;
      if (output.length >= LIMITS.entries || outputBytes > LIMITS.output) {
        limitHit = true;
        throw new OutputLimitError('Console output limit exceeded');
      }
      output.push(text);
    };
  }

  let status = 'success';
  let value = '';
  let message = '';
  try {
    let execute;
    try {
      execute = new AsyncFunction('console', `"use strict";\n${data.source}`);
    } catch (error) {
      status = 'syntax-error';
      throw error;
    }
    value = printable(await execute(consoleCapture));
    if (limitHit) throw new OutputLimitError('Console output limit exceeded');
    if (outputBytes + utf8.encode(value).length > LIMITS.output) {
      throw new OutputLimitError('Output limit exceeded');
    }
  } catch (error) {
    if (error instanceof OutputLimitError || limitHit) status = 'output-limit';
    else if (status !== 'syntax-error') status = 'runtime-error';
    const raw = error instanceof Error ? error.message : 'Execution failed';
    message = raw.slice(0, LIMITS.error);
    value = '';
  }

  let packet = JSON.stringify({
    type: 'result',
    runId: data.runId,
    status,
    output,
    value,
    message,
  });
  if (utf8.encode(packet).length > LIMITS.packet) {
    packet = JSON.stringify({
      type: 'result',
      runId: data.runId,
      status: 'output-limit',
      output: [],
      value: '',
      message: 'Result packet limit exceeded',
    });
  }
  trustedSend(packet);
};
