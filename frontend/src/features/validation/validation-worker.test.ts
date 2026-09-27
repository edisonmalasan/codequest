import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import type { ValidationCase } from './validation-types';

const script = readFileSync(
  new URL('../../../public/runtime/validation-worker.js', import.meta.url),
  'utf8',
);
const base = { id: 'one', label: 'One', feedback: 'Try again' };

async function evaluate(
  source: string,
  test: ValidationCase,
): Promise<{ status: string; passed: boolean }> {
  const messages: unknown[] = [];
  const sandbox: {
    postMessage: (value: unknown) => void;
    TextEncoder: typeof TextEncoder;
    onmessage?: (event: { data: unknown }) => Promise<void>;
  } = {
    postMessage: (value) => {
      messages.push(value);
    },
    TextEncoder,
  };
  runInContext(script, createContext(sandbox));
  await sandbox.onmessage?.({ data: { checkId: 'check-1', source, test } });
  expect(messages).toHaveLength(1);
  return JSON.parse(String(messages[0])) as { status: string; passed: boolean };
}

describe('isolated validation Worker', () => {
  it('matches exact ordered output, value structures, and different function inputs', async () => {
    expect(
      await evaluate("console.log('hello');", {
        ...base,
        mode: 'output-match',
        expectedLines: ['hello'],
      }),
    ).toMatchObject({ status: 'completed', passed: true });
    expect(
      await evaluate("console.log('hello'); console.log('extra');", {
        ...base,
        mode: 'output-match',
        expectedLines: ['hello'],
      }),
    ).toMatchObject({ status: 'completed', passed: false });
    expect(
      await evaluate('return { b: 2, a: [1] };', {
        ...base,
        mode: 'value-test',
        expected: { a: [1], b: 2 },
      }),
    ).toMatchObject({ status: 'completed', passed: true });
    expect(
      await evaluate('function double(x) { return x * 2; }', {
        ...base,
        mode: 'function-test',
        functionName: 'double',
        args: [3],
        expected: 6,
      }),
    ).toMatchObject({ status: 'completed', passed: true });
    expect(
      await evaluate('function double(x) { return x * 2; }', {
        ...base,
        mode: 'function-test',
        functionName: 'double',
        args: [0],
        expected: 0,
      }),
    ).toMatchObject({ status: 'completed', passed: true });
  });

  it('applies finite custom predicates and distinguishes failures', async () => {
    expect(
      await evaluate('return 5;', {
        ...base,
        mode: 'custom-test',
        predicate: { kind: 'number-range', min: 1, max: 10 },
      }),
    ).toMatchObject({ status: 'completed', passed: true });
    expect(
      await evaluate("console.log('hello world');", {
        ...base,
        mode: 'custom-test',
        predicate: { kind: 'output-contains', text: 'world' },
      }),
    ).toMatchObject({ status: 'completed', passed: true });
    expect(
      await evaluate('const = ;', { ...base, mode: 'value-test', expected: 1 }),
    ).toMatchObject({ status: 'syntax-error', passed: false });
    expect(
      await evaluate('throw new Error("bad")', {
        ...base,
        mode: 'value-test',
        expected: 1,
      }),
    ).toMatchObject({ status: 'runtime-error', passed: false });
  });

  it('never invokes a returned getter and rejects cycles and floods', async () => {
    expect(
      await evaluate(
        "return Object.defineProperty({}, 'secret', { enumerable: true, get() { throw new Error('getter'); } });",
        { ...base, mode: 'value-test', expected: {} },
      ),
    ).toMatchObject({ status: 'output-limit', passed: false });
    expect(
      await evaluate('const x = {}; x.self = x; return x;', {
        ...base,
        mode: 'value-test',
        expected: {},
      }),
    ).toMatchObject({ status: 'output-limit', passed: false });
    expect(
      await evaluate("console.log('x'.repeat(13000));", {
        ...base,
        mode: 'output-match',
        expectedLines: [],
      }),
    ).toMatchObject({ status: 'output-limit', passed: false });
  });
});
