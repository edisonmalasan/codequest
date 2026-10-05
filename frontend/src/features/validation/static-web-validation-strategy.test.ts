import { describe, expect, it, vi } from 'vitest';
import { StaticWebValidationStrategy } from './static-web-validation-strategy';
import { serializeWebSource, type WebSourceBundle } from './web-source';
import type { ValidationDefinition } from './validation-types';

const bundle: WebSourceBundle = {
  schemaVersion: 1,
  questId: 'Q01',
  contentVersion: '1.0.0',
  assessmentVersion: '1.0.0',
  mode: 'static-web',
  files: [
    {
      id: 'page',
      language: 'html',
      source: '<h1 id="greeting">Hello <em>world</em></h1>',
    },
    { id: 'style', language: 'css', source: 'h1 { color: blue; }' },
  ],
};
const definition: ValidationDefinition = {
  cases: [
    {
      id: 'heading',
      label: 'Heading',
      feedback: 'Use the greeting heading',
      mode: 'html-element',
      selector: '#greeting',
      expectedText: 'Hello world',
    },
    {
      id: 'color',
      label: 'Color',
      feedback: 'Use blue',
      mode: 'css-declaration',
      selector: 'h1',
      property: 'color',
      expectedValue: 'blue',
    },
  ],
};

describe('static web local Check', () => {
  it('returns ordered deterministic feedback from bounded inert markup and declarations', async () => {
    const strategy = new StaticWebValidationStrategy();
    const source = serializeWebSource(bundle);
    expect(source).not.toBeNull();
    const result = await strategy.validate({
      source: source ?? '',
      definition,
    });
    expect(result).toMatchObject({
      status: 'completed',
      passed: true,
      failedCaseIds: [],
      cases: [
        { id: 'heading', status: 'passed' },
        { id: 'color', status: 'passed' },
      ],
    });
    const failed = await strategy.validate({
      source: source ?? '',
      definition: {
        cases: [
          {
            ...definition.cases[0],
            expectedText: 'No',
          } as ValidationDefinition['cases'][number],
        ],
      },
    });
    expect(failed).toMatchObject({
      status: 'completed',
      passed: false,
      failedCaseIds: ['heading'],
    });
    await strategy.dispose();
  });

  it('rejects executable definitions and active content without making network requests', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    const strategy = new StaticWebValidationStrategy();
    const invalid = await strategy.validate({
      source: serializeWebSource(bundle) ?? '',
      definition: {
        cases: [
          {
            id: 'bad',
            label: 'Bad',
            feedback: 'Bad',
            mode: 'html-element',
            selector: '#greeting',
            expectedText: 'Hello world',
            run: () => true,
          },
        ] as unknown as ValidationDefinition['cases'],
      },
    });
    expect(invalid.status).toBe('invalid-definition');
    const active = serializeWebSource({
      ...bundle,
      files: [
        {
          ...bundle.files[0],
          source:
            '<img src="https://example.invalid/leak"><h1 id="greeting">Hello</h1>',
        },
        bundle.files[1],
      ],
    });
    expect(
      (await strategy.validate({ source: active ?? '', definition })).passed,
    ).toBe(false);
    const imported = serializeWebSource({
      ...bundle,
      files: [
        bundle.files[0],
        {
          ...bundle.files[1],
          source: '@import "https://example.invalid/leak";',
        },
      ],
    });
    expect(
      (await strategy.validate({ source: imported ?? '', definition })).passed,
    ).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });

  it('fails closed for oversized or malformed source and preserves a fresh finite check', async () => {
    const strategy = new StaticWebValidationStrategy();
    expect(
      serializeWebSource({
        ...bundle,
        files: [{ ...bundle.files[0], source: 'x'.repeat(65_537) }],
      }),
    ).toBeNull();
    expect((await strategy.validate({ source: '{', definition })).status).toBe(
      'output-limit',
    );
    expect(
      (
        await strategy.validate({
          source: serializeWebSource(bundle) ?? '',
          definition,
        })
      ).passed,
    ).toBe(true);
  });
});
