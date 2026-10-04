'use strict';

(() => {
  let trustedSend;
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const encoder = new globalThis.TextEncoder();
  const LIMITS = {
    nodes: 512,
    mutations: 256,
    packet: 16384,
    output: 12288,
    entries: 200,
  };
  const SELECTOR = /^(?:#[a-zA-Z][\w-]*|\.[a-zA-Z][\w-]*|[a-z][a-z0-9-]*)$/;
  const CLASS_TOKEN = /^[a-zA-Z_][a-zA-Z0-9_-]{0,63}$/;
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
  let session;

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
    'setTimeout',
    'setInterval',
    'queueMicrotask',
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
        /* CSP is the fallback boundary. */
      }
    }
  }

  class UnsupportedDomError extends Error {}
  class OutputLimitError extends Error {}

  const bytes = (value) => encoder.encode(value).byteLength;
  const rejectUnsupported = (name) => {
    throw new UnsupportedDomError(`${name} is not supported in this exercise`);
  };

  function createSession(command) {
    if (
      typeof command.sessionId !== 'string' ||
      !Array.isArray(command.nodes) ||
      command.nodes.length > LIMITS.nodes ||
      typeof command.source !== 'string'
    )
      return null;
    const records = new Map();
    for (const raw of command.nodes) {
      if (
        !raw ||
        typeof raw.nodeId !== 'string' ||
        !/^n\d{1,3}$/.test(raw.nodeId) ||
        records.has(raw.nodeId) ||
        typeof raw.tag !== 'string' ||
        typeof raw.elementId !== 'string' ||
        !Array.isArray(raw.classes) ||
        typeof raw.ownText !== 'string' ||
        !raw.attributes ||
        (raw.parentId !== null && !records.has(raw.parentId))
      )
        return null;
      records.set(raw.nodeId, {
        nodeId: raw.nodeId,
        parentId: raw.parentId,
        tag: raw.tag,
        elementId: raw.elementId,
        classes: new Set(raw.classes),
        ownText: raw.ownText,
        attributes: new Map(Object.entries(raw.attributes)),
        styles: new Map(),
        listeners: new Map(),
        removed: false,
      });
    }
    return {
      sessionId: command.sessionId,
      records,
      source: command.source,
      mutations: [],
      output: [],
      outputBytes: 0,
      mutationBytes: 0,
      listenerCount: 0,
      activeStepId: '',
    };
  }

  function emitMutation(record, kind, value, name) {
    if (record.removed) rejectUnsupported('Detached element mutation');
    if (!session || session.mutations.length >= LIMITS.mutations) {
      throw new OutputLimitError('DOM mutation limit exceeded');
    }
    const mutation = { nodeId: record.nodeId, kind, value };
    if (name) mutation.name = name;
    const size = bytes(JSON.stringify(mutation));
    session.mutationBytes += size;
    if (size > LIMITS.packet || session.mutationBytes > 131072) {
      throw new OutputLimitError('DOM mutation output limit exceeded');
    }
    session.mutations.push(mutation);
  }

  function element(record) {
    const facade = Object.create(null);
    const classList = Object.freeze({
      add(...tokens) {
        for (const token of tokens) {
          if (!CLASS_TOKEN.test(token)) rejectUnsupported('Class name');
          record.classes.add(token);
        }
        emitMutation(record, 'class', [...record.classes].join(' '));
      },
      remove(...tokens) {
        for (const token of tokens) record.classes.delete(token);
        emitMutation(record, 'class', [...record.classes].join(' '));
      },
      contains(token) {
        return record.classes.has(token);
      },
      toggle(token) {
        if (!CLASS_TOKEN.test(token)) rejectUnsupported('Class name');
        if (record.classes.has(token)) record.classes.delete(token);
        else record.classes.add(token);
        emitMutation(record, 'class', [...record.classes].join(' '));
        return record.classes.has(token);
      },
    });
    const style = Object.create(null);
    for (const [property, rule] of Object.entries(STYLE_VALUES)) {
      Object.defineProperty(style, property, {
        enumerable: true,
        get: () => record.styles.get(property) ?? '',
        set(value) {
          if (typeof value !== 'string' || !rule.test(value))
            rejectUnsupported('Style value');
          record.styles.set(property, value);
          emitMutation(record, 'style', value, property);
        },
      });
    }
    Object.preventExtensions(style);
    Object.defineProperties(facade, {
      id: { enumerable: true, get: () => record.elementId },
      tagName: { enumerable: true, get: () => record.tag.toUpperCase() },
      textContent: {
        enumerable: true,
        get() {
          let text = record.ownText;
          for (const child of session.records.values()) {
            if (!child.removed && child.parentId === record.nodeId)
              text += element(child).textContent;
          }
          return text;
        },
        set(value) {
          if (typeof value !== 'string' || bytes(value) > 4096) {
            throw new OutputLimitError('Text is too large');
          }
          record.ownText = value;
          for (const child of session.records.values()) {
            let ancestor = child.parentId;
            while (ancestor) {
              if (ancestor === record.nodeId) {
                child.removed = true;
                break;
              }
              ancestor = session.records.get(ancestor)?.parentId;
            }
          }
          emitMutation(record, 'text', value);
        },
      },
      classList: { enumerable: true, value: classList },
      style: { enumerable: true, value: style },
      value: {
        enumerable: true,
        get: () => record.attributes.get('value') ?? '',
        set(value) {
          if (
            record.tag !== 'input' ||
            typeof value !== 'string' ||
            bytes(value) > 256
          ) {
            rejectUnsupported('Input value');
          }
          record.attributes.set('value', value);
          emitMutation(record, 'value', value);
        },
      },
      getAttribute: {
        value(name) {
          return record.attributes.get(name) ?? null;
        },
      },
      setAttribute: {
        value(name, value) {
          if (
            !['title', 'aria-label'].includes(name) ||
            typeof value !== 'string' ||
            !safeText(value)
          )
            rejectUnsupported('Attribute');
          record.attributes.set(name, value);
          emitMutation(record, 'attribute', value, name);
        },
      },
      addEventListener: {
        value(type, callback) {
          if (
            !['click', 'input', 'change'].includes(type) ||
            typeof callback !== 'function'
          ) {
            rejectUnsupported('Event listener');
          }
          if (session.listenerCount >= 128)
            throw new OutputLimitError('Too many listeners');
          const list = record.listeners.get(type) ?? [];
          list.push(callback);
          record.listeners.set(type, list);
          session.listenerCount += 1;
        },
      },
      removeEventListener: {
        value(type, callback) {
          const list = record.listeners.get(type);
          if (!list) return;
          const index = list.indexOf(callback);
          if (index >= 0) {
            list.splice(index, 1);
            session.listenerCount -= 1;
          }
        },
      },
    });
    return Object.preventExtensions(facade);
  }

  function select(selector, all) {
    if (typeof selector !== 'string' || !SELECTOR.test(selector))
      rejectUnsupported('Selector');
    const matches = [];
    for (const record of session.records.values()) {
      if (record.removed) continue;
      if (
        (selector[0] === '#' && record.elementId === selector.slice(1)) ||
        (selector[0] === '.' && record.classes.has(selector.slice(1))) ||
        (selector[0] !== '#' && selector[0] !== '.' && record.tag === selector)
      )
        matches.push(element(record));
      if (!all && matches.length) break;
    }
    return all ? Object.freeze(matches) : (matches[0] ?? null);
  }

  const documentFacade = Object.freeze(
    Object.assign(Object.create(null), {
      querySelector: (selector) => select(selector, false),
      querySelectorAll: (selector) => select(selector, true),
      getElementById: (id) => select(`#${id}`, false),
    }),
  );

  function captureConsole() {
    const consoleCapture = Object.create(null);
    for (const method of ['log', 'info', 'warn', 'error', 'debug']) {
      consoleCapture[method] = (...values) => {
        const line = values
          .map((value) => {
            if (
              value === null ||
              ['string', 'number', 'boolean', 'undefined'].includes(
                typeof value,
              )
            )
              return String(value);
            return '[object]';
          })
          .join(' ');
        session.outputBytes += bytes(line);
        if (
          session.output.length >= LIMITS.entries ||
          session.outputBytes > LIMITS.output
        ) {
          throw new OutputLimitError('Console output limit exceeded');
        }
        session.output.push(line);
      };
    }
    return Object.freeze(consoleCapture);
  }

  function sendStep(status, message) {
    const packet = {
      type: 'step',
      sessionId: session.sessionId,
      stepId: session.activeStepId,
      status,
      message: String(message).slice(0, 1024),
      output: session.output.splice(0),
      mutations: status === 'ready' ? session.mutations.splice(0) : [],
    };
    let raw = JSON.stringify(packet);
    if (bytes(raw) > LIMITS.packet) {
      raw = JSON.stringify({
        ...packet,
        status: 'output-limit',
        message: 'Packet limit exceeded',
        output: [],
        mutations: [],
      });
    }
    trustedSend?.(raw);
  }

  async function run(command) {
    session = createSession(command);
    if (!session) return;
    session.activeStepId = command.stepId;
    const consoleCapture = captureConsole();
    let status = 'ready';
    let message = '';
    try {
      let execute;
      try {
        execute = new AsyncFunction(
          'document',
          'console',
          `"use strict";\n${session.source}`,
        );
      } catch (error) {
        status = 'syntax-error';
        throw error;
      }
      await execute(documentFacade, consoleCapture);
    } catch (error) {
      if (error instanceof OutputLimitError) status = 'output-limit';
      else if (error instanceof UnsupportedDomError) status = 'unsupported';
      else if (status !== 'syntax-error') status = 'runtime-error';
      message =
        error instanceof Error ? error.message : 'Interactive execution failed';
    }
    sendStep(status, message);
  }

  async function dispatch(command) {
    if (
      !session ||
      command.sessionId !== session.sessionId ||
      typeof command.stepId !== 'string'
    )
      return;
    const event = command.event;
    if (
      !event ||
      !['click', 'input', 'change'].includes(event.type) ||
      typeof event.targetId !== 'string'
    )
      return;
    const record = session.records.get(event.targetId);
    if (
      !record ||
      record.removed ||
      (event.value !== undefined &&
        (typeof event.value !== 'string' || bytes(event.value) > 256))
    )
      return;
    session.activeStepId = command.stepId;
    session.mutations.length = 0;
    session.output.length = 0;
    if (record.tag === 'input' && event.value !== undefined)
      record.attributes.set('value', event.value);
    let status = 'ready';
    let message = '';
    try {
      const target = element(record);
      const safeEvent = Object.freeze({
        type: event.type,
        target,
        currentTarget: target,
      });
      for (const handler of record.listeners.get(event.type) ?? []) {
        await handler(safeEvent);
      }
    } catch (error) {
      if (error instanceof OutputLimitError) status = 'output-limit';
      else if (error instanceof UnsupportedDomError) status = 'unsupported';
      else status = 'runtime-error';
      message =
        error instanceof Error ? error.message : 'Interactive handler failed';
    }
    sendStep(status, message);
  }

  globalThis.addEventListener('message', ({ data }) => {
    if (!data || typeof data !== 'object') return;
    if (!session && data.type === 'start' && data.privatePort) {
      const privatePort = data.privatePort;
      trustedSend = privatePort.postMessage.bind(privatePort);
      privatePort.onmessage = ({ data: command }) => {
        if (session && command?.type === 'event') void dispatch(command);
      };
      privatePort.start();
      void run(data);
    }
  });
  for (const name of [
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
    'onmessage',
  ]) {
    Object.defineProperty(globalThis, name, {
      value: undefined,
      writable: false,
      configurable: false,
    });
  }
})();
