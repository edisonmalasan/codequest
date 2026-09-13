// Deliberately not a JavaScript security wrapper. Origin and effective CSP are tested separately.
const send = self.postMessage.bind(self);
const encode = JSON.stringify.bind(JSON);
const utf8 = new TextEncoder();
const descriptors = Object.getOwnPropertyDescriptors.bind(Object);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let started = false;

function printable(value, depth = 0, seen = new Set()) {
  if (depth > 8) throw new Error('output-limit: nested output');
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    if (utf8.encode(value).length > 8192) throw new Error('output-limit: single value');
    return value;
  }
  if (typeof value !== 'object') return `[${typeof value}]`;
  if (seen.has(value)) throw new Error('output-limit: cyclic output');
  seen.add(value);
  // No getter or toJSON invocation; hostile proxies can still trap here, inside the terminable worker.
  const properties = descriptors(value);
  const entries = Object.entries(properties);
  if (entries.length > 200) throw new Error('output-limit: object properties');
  return '{' + entries.map(([key, property]) => `${key}:${'value' in property ? printable(property.value, depth + 1, seen) : '[accessor]'}`).join(',') + '}';
}

self.onmessage = async (event) => {
  if (started) return;
  started = true;
  const input = event.data;
  if (!input || typeof input.source !== 'string') return;
  const identity = { run: input.run, task: input.task, contentVersion: input.contentVersion, assessmentVersion: input.assessmentVersion };
  const output = [];
  let bytes = 0;
  let limitHit = false;
  const consoleCapture = {};
  for (const method of ['log', 'info', 'warn', 'error', 'debug']) {
    consoleCapture[method] = (...values) => {
      const text = values.map((value) => printable(value)).join(' ');
      bytes += utf8.encode(text).length;
      if (output.length >= 200 || bytes > 65536) { limitHit = true; throw new Error('output-limit: console'); }
      output.push(text);
    };
  }
  let status = 'success';
  let value = '';
  try {
    if (utf8.encode(input.source).length > 65536) throw new Error('output-limit: source');
    const suffix = input.task === 'RECORDS' ? '\nreturn summarize([{name:"Potion",quantity:2},{name:"Key",quantity:3}]);' : '';
    let execute;
    try { execute = new AsyncFunction('console', input.source + suffix); }
    catch (error) { status = 'syntax-error'; throw error; }
    if (input.previewMarker === true) send(input.run + ':preview-started');
    value = printable(await execute(consoleCapture));
    if (limitHit) throw new Error('output-limit: swallowed console error');
  } catch (error) {
    const message = error instanceof Error ? String(error.message).slice(0, 1024) : 'Unprintable error';
    if (message.startsWith('output-limit:') || limitHit) status = 'output-limit';
    else if (status !== 'syntax-error') status = 'runtime-error';
    value = message;
  }
  let result = encode({ ...identity, status, output, value });
  if (utf8.encode(result).length > 16384) result = encode({ ...identity, status: 'output-limit', output: [], value: 'output-limit: result payload' });
  send(result);
};
