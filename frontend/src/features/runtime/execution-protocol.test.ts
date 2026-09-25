import { describe, expect, it } from 'vitest';
import {
  decodeTerminalPacket,
  resolveRunnerOrigin,
} from './execution-protocol';
import { EXECUTION_LIMITS } from './execution-types';

describe('execution protocol', () => {
  it.each([
    'success',
    'syntax-error',
    'runtime-error',
    'timeout',
    'output-limit',
    'cancelled',
    'internal-error',
  ] as const)('accepts a bounded %s result', (status) => {
    expect(
      decodeTerminalPacket(
        {
          type: 'result',
          runId: 'active',
          status,
          output: ['one'],
          value: 'two',
          message: '',
        },
        'active',
      )?.status,
    ).toBe(status);
  });

  it('rejects stale, malformed, and oversized packets', () => {
    const valid = {
      type: 'result',
      runId: 'active',
      status: 'success',
      output: [],
      value: '',
      message: '',
    };
    expect(
      decodeTerminalPacket({ ...valid, runId: 'stale' }, 'active'),
    ).toBeNull();
    expect(
      decodeTerminalPacket({ ...valid, status: 'passed' }, 'active'),
    ).toBeNull();
    expect(
      decodeTerminalPacket(
        {
          ...valid,
          output: Array.from(
            { length: EXECUTION_LIMITS.outputEntries + 1 },
            () => 'x',
          ),
        },
        'active',
      ),
    ).toBeNull();
    expect(
      decodeTerminalPacket(
        { ...valid, value: 'x'.repeat(EXECUTION_LIMITS.outputBytes + 1) },
        'active',
      ),
    ).toBeNull();
    expect(
      decodeTerminalPacket(
        { ...valid, message: 'x'.repeat(EXECUTION_LIMITS.errorBytes + 1) },
        'active',
      ),
    ).toBeNull();
  });

  it('accepts only a distinct credential-free HTTPS or loopback origin', () => {
    expect(
      resolveRunnerOrigin(
        'https://runner.codequest.test',
        'https://app.codequest.test',
      ),
    ).toBe('https://runner.codequest.test');
    expect(
      resolveRunnerOrigin('http://127.0.0.2:3100', 'http://127.0.0.1:3100'),
    ).toBe('http://127.0.0.2:3100');
    expect(
      resolveRunnerOrigin(
        'https://app.codequest.test',
        'https://app.codequest.test',
      ),
    ).toBeNull();
    expect(
      resolveRunnerOrigin(
        'http://runner.example.test',
        'https://app.example.test',
      ),
    ).toBeNull();
    expect(
      resolveRunnerOrigin(
        'https://user:secret@runner.example.test',
        'https://app.example.test',
      ),
    ).toBeNull();
    expect(
      resolveRunnerOrigin(undefined, 'https://app.example.test'),
    ).toBeNull();
  });
});
