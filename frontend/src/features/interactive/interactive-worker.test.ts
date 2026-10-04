import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const script = readFileSync(
  new URL('../../../public/runtime/interactive-worker.js', import.meta.url),
  'utf8',
);
const nodes = [
  {
    nodeId: 'n0',
    parentId: null,
    tag: 'main',
    elementId: 'root',
    classes: [],
    ownText: '',
    attributes: {},
  },
  {
    nodeId: 'n1',
    parentId: 'n0',
    tag: 'button',
    elementId: 'add',
    classes: ['control'],
    ownText: 'Add',
    attributes: {},
  },
  {
    nodeId: 'n2',
    parentId: 'n0',
    tag: 'input',
    elementId: 'name',
    classes: [],
    ownText: '',
    attributes: { value: '' },
  },
  {
    nodeId: 'n3',
    parentId: 'n0',
    tag: 'p',
    elementId: 'result',
    classes: [],
    ownText: '',
    attributes: {},
  },
];

function worker() {
  let listener: ((event: { data: unknown }) => void) | undefined;
  let resolvePacket: ((packet: unknown) => void) | undefined;
  const privatePort: {
    onmessage?: (event: { data: unknown }) => void;
    postMessage(raw: string): void;
    start(): void;
  } = {
    postMessage(raw) {
      resolvePacket?.(JSON.parse(raw));
      resolvePacket = undefined;
    },
    start() {},
  };
  const sandbox = {
    TextEncoder,
    postMessage: () => {
      throw new Error('Global result channel was used');
    },
    addEventListener(
      type: string,
      callback: (event: { data: unknown }) => void,
    ) {
      if (type === 'message') listener = callback;
    },
  };
  runInContext(script, createContext(sandbox));
  return {
    send(data: unknown): Promise<unknown> {
      return new Promise((resolve) => {
        resolvePacket = resolve;
        if (privatePort.onmessage) privatePort.onmessage({ data });
        else if (typeof data === 'object' && data !== null)
          listener?.({ data: { ...data, privatePort } });
      });
    },
  };
}

describe('interactive learner Worker facade', () => {
  it('supports named selector, text, class, attribute, style, console, and event operations', async () => {
    const instance = worker();
    const initial = await instance.send({
      type: 'start',
      sessionId: 'one',
      stepId: 'initial',
      nodes,
      source: `
        const button = document.getElementById('add');
        console.log(document.querySelectorAll('.control').length, document.querySelector('button').tagName);
        button.classList.add('active');
        button.style.color = 'red';
        button.setAttribute('aria-label', 'Add one');
        console.log(button.getAttribute('aria-label'), button.classList.contains('active'));
        document.getElementById('name').addEventListener('input', (event) => {
          document.getElementById('result').textContent = event.target.value;
        });
        button.addEventListener('click', () => { document.getElementById('result').textContent = 'Clicked'; });
      `,
    });
    expect(initial).toMatchObject({
      status: 'ready',
      output: ['1 BUTTON', 'Add one true'],
      mutations: [
        { kind: 'class', nodeId: 'n1', value: 'control active' },
        { kind: 'style', nodeId: 'n1', name: 'color', value: 'red' },
        {
          kind: 'attribute',
          nodeId: 'n1',
          name: 'aria-label',
          value: 'Add one',
        },
      ],
    });
    expect(
      await instance.send({
        type: 'event',
        sessionId: 'one',
        stepId: 'click',
        event: { type: 'click', targetId: 'n1' },
      }),
    ).toMatchObject({
      status: 'ready',
      mutations: [{ kind: 'text', nodeId: 'n3', value: 'Clicked' }],
    });
    expect(
      await instance.send({
        type: 'event',
        sessionId: 'one',
        stepId: 'input',
        event: { type: 'input', targetId: 'n2', value: 'Ava' },
      }),
    ).toMatchObject({
      status: 'ready',
      mutations: [{ kind: 'text', nodeId: 'n3', value: 'Ava' }],
    });
  });

  it('rejects malformed selectors, unsupported sinks, and browser authority', async () => {
    expect(
      await worker().send({
        type: 'start',
        sessionId: 'one',
        stepId: 'initial',
        nodes,
        source: "document.querySelector('main > button');",
      }),
    ).toMatchObject({ status: 'unsupported', mutations: [] });
    expect(
      await worker().send({
        type: 'start',
        sessionId: 'one',
        stepId: 'initial',
        nodes,
        source:
          "document.getElementById('add').setAttribute('onclick', 'fetch(1)');",
      }),
    ).toMatchObject({ status: 'unsupported', mutations: [] });
    expect(
      await worker().send({
        type: 'start',
        sessionId: 'one',
        stepId: 'initial',
        nodes,
        source:
          'console.log(typeof window, typeof fetch, typeof indexedDB, typeof Worker, typeof document.createElement);',
      }),
    ).toMatchObject({
      status: 'ready',
      output: ['undefined undefined undefined undefined undefined'],
    });
  });

  it('stops mutation flooding before forwarding partial DOM changes', async () => {
    expect(
      await worker().send({
        type: 'start',
        sessionId: 'one',
        stepId: 'initial',
        nodes,
        source:
          "for (let i = 0; i < 257; i++) document.getElementById('result').textContent = String(i);",
      }),
    ).toMatchObject({ status: 'output-limit', mutations: [] });
  });
});
