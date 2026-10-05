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

  it('maps published static and interactive cases without executable test source', () => {
    expect(
      questValidationDefinition({
        cases: [
          {
            id: 'heading',
            category: 'normal',
            kind: 'html-element',
            feedback: 'Add a heading',
            selector: '#answer',
            expectedText: 'Hello',
          },
          {
            id: 'color',
            category: 'boundary',
            kind: 'css-declaration',
            feedback: 'Set the color',
            selector: 'h1',
            property: 'color',
            expectedValue: 'blue',
          },
        ],
      }),
    ).toMatchObject({
      cases: [{ mode: 'html-element' }, { mode: 'css-declaration' }],
    });
    expect(
      questValidationDefinition({
        cases: [
          {
            id: 'clicked',
            category: 'normal',
            kind: 'interactive-text',
            feedback: 'Handle the click',
            selector: '#answer',
            expectedText: 'Done',
            events: [{ type: 'click', targetId: 'trigger' }],
          },
        ],
      }),
    ).toMatchObject({
      cases: [
        {
          mode: 'interactive-text',
          events: [{ type: 'click', targetId: 'trigger' }],
        },
      ],
    });
  });

  it('maps a published semantic case without treating it as executable test code', () => {
    expect(
      questValidationDefinition({
        cases: [
          {
            id: 'label',
            category: 'normal',
            kind: 'html-semantic',
            feedback: 'Connect the label.',
            selector: '#search-label',
            tag: 'label',
            expectedText: 'Search',
            expectedAttributes: [{ name: 'for', value: 'search-field' }],
          },
        ],
      }),
    ).toMatchObject({
      cases: [
        {
          mode: 'html-semantic',
          tag: 'label',
          expectedAttributes: [{ name: 'for', value: 'search-field' }],
        },
      ],
    });
  });
});
