import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

interface WorkerSandbox {
  onmessage?: (event: {
    data: { runId: string; source: string };
  }) => Promise<void>;
  postMessage(value: unknown): void;
  TextEncoder: typeof TextEncoder;
}

const workerScript = readFileSync(
  new URL('../../../public/runtime/javascript-worker.js', import.meta.url),
  'utf8',
);

async function executeWorkerSource(source: string) {
  const messages: unknown[] = [];
  const sandbox: WorkerSandbox = {
    postMessage(value) {
      messages.push(value);
    },
    TextEncoder,
  };
  const context = createContext(sandbox);
  runInContext(workerScript, context);
  await sandbox.onmessage?.({ data: { runId: 'run-1', source } });
  expect(messages).toHaveLength(1);
  return JSON.parse(String(messages[0])) as {
    status: string;
    output: string[];
    value: string;
    message: string;
  };
}

describe('JavaScript learner Worker asset', () => {
  it('formats primitives and nested values without invoking accessors or toJSON', async () => {
    const result = await executeWorkerSource(`
      const value = { nested: { answer: 42 }, toJSON() { throw new Error('called toJSON'); } };
      Object.defineProperty(value, 'secret', { get() { throw new Error('called getter'); } });
      console.log('ready', true, undefined);
      return value;
    `);

    expect(result).toMatchObject({
      status: 'success',
      output: ['ready true undefined'],
    });
    expect(result.value).toContain('nested:{answer:42}');
    expect(result.value).toContain('toJSON:[function]');
    expect(result.value).toContain('secret:[accessor]');
  });

  it.each([
    ['cycle', 'const value = {}; value.self = value; return value;'],
    [
      'depth',
      'let value = {}; let cursor = value; for (let i = 0; i < 10; i += 1) { cursor.next = {}; cursor = cursor.next; } return value;',
    ],
    [
      'width',
      'const value = {}; for (let i = 0; i < 201; i += 1) value[`key${i}`] = i; return value;',
    ],
    ['bytes', `return '${'x'.repeat(12_289)}';`],
    [
      'entry count',
      'for (let i = 0; i < 201; i += 1) console.log(i); return 1;',
    ],
  ])('returns output-limit for %s bounds', async (_name, source) => {
    await expect(executeWorkerSource(source)).resolves.toMatchObject({
      status: 'output-limit',
    });
  });

  it('turns a hostile proxy formatter trap into a bounded output-limit error', async () => {
    const result = await executeWorkerSource(
      `return new Proxy({}, { ownKeys() { throw new Error('proxy trap'); } });`,
    );

    expect(result).toMatchObject({
      status: 'output-limit',
      message: 'Output value cannot be inspected',
    });
  });
});
