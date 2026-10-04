import { describe, expect, it, vi } from 'vitest';
import type {
  InteractiveResult,
  InteractiveWebAdapter,
} from '@/features/interactive';
import { InteractiveWebValidationStrategy } from './interactive-web-validation-strategy';
import { serializeWebSource, type WebSourceBundle } from './web-source';
import type { ValidationDefinition } from './validation-types';

const bundle: WebSourceBundle = {
  schemaVersion: 1,
  questId: 'Q01',
  contentVersion: '1.0.0',
  assessmentVersion: '1.0.0',
  mode: 'interactive-web',
  files: [
    {
      id: 'page',
      language: 'html',
      source: '<button id="trigger">Press</button><p id="answer">Ready</p>',
    },
    {
      id: 'logic',
      language: 'javascript',
      source: 'document.getElementById("answer").textContent = "Done";',
    },
  ],
};
const definition: ValidationDefinition = {
  cases: [
    {
      id: 'clicked',
      label: 'Clicked',
      feedback: 'Update the answer',
      mode: 'interactive-text',
      selector: '#answer',
      events: [{ type: 'click', targetId: 'trigger' }],
      expectedText: 'Done',
    },
  ],
};

function outcome(status: InteractiveResult['status']): InteractiveResult {
  return {
    generationId: crypto.randomUUID(),
    status,
    message: status,
    output: [],
    filteredActiveContent: false,
    description: '',
    durationMs: 1,
  };
}

class FakeAdapter implements InteractiveWebAdapter {
  readonly dispatch = vi.fn(async () => outcome(this.status));
  readonly dispose = vi.fn(async () => {});
  readonly cancel = vi.fn(async () => {});
  constructor(readonly status: InteractiveResult['status']) {}
  attach(): void {}
  subscribe(): () => void {
    return () => {};
  }
  async start(): Promise<InteractiveResult> {
    return outcome(this.status);
  }
  readText(id: string): string | null {
    return id === 'answer' ? 'Done' : null;
  }
  async reload(): Promise<InteractiveResult> {
    return outcome(this.status);
  }
}

describe('interactive local Check', () => {
  it('runs a bounded declared event, compares state, and disposes its isolated adapter', async () => {
    const adapter = new FakeAdapter('ready');
    const strategy = new InteractiveWebValidationStrategy(
      'http://127.0.0.1:3000',
      'http://127.0.0.2:3000',
      () => adapter,
    );
    const result = await strategy.validate({
      source: serializeWebSource(bundle) ?? '',
      definition,
    });
    expect(result).toMatchObject({
      status: 'completed',
      passed: true,
      cases: [{ id: 'clicked', status: 'passed' }],
    });
    expect(adapter.dispatch).toHaveBeenCalledWith(
      { type: 'click', targetId: expect.stringMatching(/^n\d+$/) },
      expect.any(AbortSignal),
    );
    expect(adapter.dispose).toHaveBeenCalled();
    await strategy.dispose();
  });

  it('fails closed on unsupported definitions, malformed source and a loop, then recovers', async () => {
    const adapters = [new FakeAdapter('timeout'), new FakeAdapter('ready')];
    const strategy = new InteractiveWebValidationStrategy(
      'http://127.0.0.1:3000',
      'http://127.0.0.2:3000',
      () => adapters.shift() ?? new FakeAdapter('ready'),
    );
    const source = serializeWebSource(bundle) ?? '';
    expect(
      (
        await strategy.validate({
          source,
          definition: {
            cases: [
              {
                ...definition.cases[0],
                events: [{ type: 'click', targetId: 'missing' }],
              } as ValidationDefinition['cases'][number],
            ],
          },
        })
      ).status,
    ).toBe('invalid-definition');
    expect((await strategy.validate({ source: '{', definition })).passed).toBe(
      false,
    );
    expect((await strategy.validate({ source, definition })).status).toBe(
      'timeout',
    );
    expect((await strategy.validate({ source, definition })).passed).toBe(true);
    await strategy.dispose();
  });
});
