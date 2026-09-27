'use strict';

const trustedSend = globalThis.postMessage.bind(globalThis);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const utf8 = new globalThis.TextEncoder();
const limits = {
  output: 12288,
  entries: 200,
  value: 4096,
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
      /* CSP remains authoritative. */
    }
  }
}

class LimitError extends Error {}

function snapshot(value, seen = new Set(), depth = 0) {
  if (depth > limits.depth) throw new LimitError('Value is too deep');
  if (value === null || typeof value === 'string' || typeof value === 'boolean')
    return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'object' || seen.has(value))
    throw new LimitError('Unsupported value');
  seen.add(value);
  let descriptors;
  try {
    descriptors = Object.getOwnPropertyDescriptors(value);
  } catch {
    throw new LimitError('Value cannot be inspected');
  }
  const keys = Object.keys(descriptors);
  if (keys.length > limits.width + 1) throw new LimitError('Value is too wide');
  let result;
  if (Array.isArray(value)) {
    if (
      value.length > limits.width ||
      keys.some((key) => key !== 'length' && !/^(0|[1-9]\d*)$/.test(key))
    )
      throw new LimitError('Unsupported array');
    result = [];
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = descriptors[index];
      if (!descriptor || !Object.hasOwn(descriptor, 'value'))
        throw new LimitError('Unsupported array');
      result.push(snapshot(descriptor.value, seen, depth + 1));
    }
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null)
      throw new LimitError('Unsupported object');
    result = Object.create(null);
    for (const key of keys) {
      const descriptor = descriptors[key];
      if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value'))
        throw new LimitError('Unsupported property');
      result[key] = snapshot(descriptor.value, seen, depth + 1);
    }
  }
  seen.delete(value);
  if (utf8.encode(JSON.stringify(result)).length > limits.value)
    throw new LimitError('Value is too large');
  return result;
}

function equal(left, right) {
  if (left === right) return true;
  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) => Object.hasOwn(right, key) && equal(left[key], right[key]),
    )
  );
}

function printable(value) {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  if (typeof value === 'bigint') return String(value);
  if (typeof value === 'function') return '[function]';
  return JSON.stringify(snapshot(value));
}

globalThis.onmessage = async ({ data }) => {
  if (started) return;
  started = true;
  if (
    !data ||
    typeof data.checkId !== 'string' ||
    typeof data.source !== 'string' ||
    !data.test ||
    typeof data.test.id !== 'string'
  )
    return;
  const test = data.test;
  const output = [];
  let outputBytes = 0;
  let outputLimit = false;
  const capture = {};
  for (const method of ['log', 'info', 'warn', 'error', 'debug']) {
    capture[method] = (...values) => {
      const line = values.map(printable).join(' ');
      outputBytes += utf8.encode(line).length;
      if (output.length >= limits.entries || outputBytes > limits.output) {
        outputLimit = true;
        throw new LimitError('Console output limit exceeded');
      }
      output.push(line);
    };
  }
  let status = 'completed';
  let passed = false;
  try {
    let execute;
    try {
      const suffix =
        test.mode === 'function-test'
          ? `\nreturn ${test.functionName}(...args);`
          : '';
      execute = new AsyncFunction(
        'console',
        'args',
        `"use strict";\n${data.source}${suffix}`,
      );
    } catch (error) {
      status = 'syntax-error';
      throw error;
    }
    const raw = await execute(
      capture,
      test.mode === 'function-test' ? test.args : [],
    );
    if (outputLimit) throw new LimitError('Console output limit exceeded');
    if (test.mode === 'output-match') {
      passed =
        output.length === test.expectedLines.length &&
        output.every((line, index) => line === test.expectedLines[index]);
    } else if (
      test.mode === 'custom-test' &&
      test.predicate.kind === 'output-contains'
    ) {
      passed = output.join('\n').includes(test.predicate.text);
    } else {
      const value = snapshot(raw);
      if (test.mode === 'custom-test')
        passed =
          typeof value === 'number' &&
          value >= test.predicate.min &&
          value <= test.predicate.max;
      else passed = equal(value, test.expected);
    }
  } catch (error) {
    status =
      outputLimit || error instanceof LimitError
        ? 'output-limit'
        : status === 'syntax-error'
          ? status
          : 'runtime-error';
  }
  const packet = JSON.stringify({
    type: 'case-result',
    checkId: data.checkId,
    caseId: test.id,
    status,
    passed,
  });
  if (utf8.encode(packet).length <= limits.packet) trustedSend(packet);
};
