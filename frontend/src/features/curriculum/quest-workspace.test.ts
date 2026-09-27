import { describe, expect, it } from 'vitest';
import type { QuestDetail } from '@/lib/api-client';
import { questValidationDefinition } from './quest-workspace';

const quest: Pick<QuestDetail, 'cases'> = {
  cases: [
    {
      id: 'normal',
      category: 'normal',
      kind: 'console',
      feedback: 'Try again',
      expectedOutput: 'Hello',
    },
    {
      id: 'boundary',
      category: 'boundary',
      kind: 'function',
      feedback: 'Try again',
      functionName: 'double',
      args: [0],
      expected: {},
    },
  ],
};

describe('published quest validation mapping', () => {
  it('maps published data-only cases in stable order', () => {
    expect(questValidationDefinition(quest)).toEqual({
      cases: [
        {
          id: 'normal',
          label: 'normal',
          feedback: 'Try again',
          mode: 'output-match',
          expectedLines: ['Hello'],
        },
        {
          id: 'boundary',
          label: 'boundary',
          feedback: 'Try again',
          mode: 'function-test',
          functionName: 'double',
          args: [0],
          expected: {},
        },
      ],
    });
  });
  it('fails closed on incomplete fixture data', () => {
    expect(
      questValidationDefinition({
        ...quest,
        cases: [{ ...quest.cases[0], expectedOutput: undefined }],
      }),
    ).toBeUndefined();
  });
});
