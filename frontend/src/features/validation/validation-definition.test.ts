import { describe, expect, it } from 'vitest';
import { validDefinition } from './validation-definition';

const base = { id: 'case-1', label: 'Case 1', feedback: 'Try again' };

describe('validation definitions', () => {
  it('accepts all four bounded data-only modes', () => {
    expect(
      validDefinition({
        cases: [
          {
            ...base,
            id: 'out',
            mode: 'output-match',
            expectedLines: ['hello'],
          },
          {
            ...base,
            id: 'value',
            mode: 'value-test',
            expected: { answer: [1, 2] },
          },
          {
            ...base,
            id: 'function',
            mode: 'function-test',
            functionName: 'solve',
            args: [2],
            expected: 4,
          },
          {
            ...base,
            id: 'custom',
            mode: 'custom-test',
            predicate: { kind: 'number-range', min: 1, max: 5 },
          },
        ],
      }),
    ).toBe(true);
  });

  it.each([
    { cases: [] },
    {
      cases: [
        { ...base, mode: 'value-test', expected: 1 },
        { ...base, mode: 'value-test', expected: 1 },
      ],
    },
    { cases: [{ ...base, mode: 'value-test', expected: () => 1 }] },
    {
      cases: [
        {
          ...base,
          mode: 'custom-test',
          predicate: { kind: 'regex', pattern: '(a+)+' },
        },
      ],
    },
    {
      cases: [
        {
          ...base,
          mode: 'function-test',
          functionName: 'solve();',
          args: [],
          expected: 1,
        },
      ],
    },
    {
      cases: [
        { ...base, mode: 'output-match', expectedLines: ['x'.repeat(12_289)] },
      ],
    },
  ])('rejects malformed or executable definitions', (definition) => {
    expect(validDefinition(definition)).toBe(false);
  });

  it('rejects getters and cyclic values without invoking them', () => {
    const value: Record<string, unknown> = {};
    value.self = value;
    expect(
      validDefinition({
        cases: [{ ...base, mode: 'value-test', expected: value }],
      }),
    ).toBe(false);
    const getter = Object.defineProperty({}, 'secret', {
      enumerable: true,
      get() {
        throw new Error('invoked');
      },
    });
    expect(
      validDefinition({
        cases: [{ ...base, mode: 'value-test', expected: getter }],
      }),
    ).toBe(false);
    const testCase = Object.defineProperty(
      { ...base, mode: 'value-test', expected: 1 },
      'label',
      {
        enumerable: true,
        get() {
          throw new Error('invoked');
        },
      },
    );
    expect(validDefinition({ cases: [testCase] })).toBe(false);
  });
});
