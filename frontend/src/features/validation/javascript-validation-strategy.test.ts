import { describe, expect, it, vi } from 'vitest';
import type {
  BootstrapChannel,
  BootstrapCommand,
} from '@/features/runtime/bootstrap-channel';
import { JavaScriptValidationStrategy } from './javascript-validation-strategy';
import type { ValidationDefinition } from './validation-types';

class FakeChannel implements BootstrapChannel {
  constructor(
    readonly ready: Promise<void> = Promise.resolve(),
    private readonly onDispose?: () => void,
  ) {}
  readonly commands: BootstrapCommand[] = [];
  disposed = false;
  private listeners = new Set<(value: unknown) => void>();
  post(command: BootstrapCommand): void {
    this.commands.push(command);
    if (command.type === 'cancel' && command.checkId) {
      queueMicrotask(() =>
        this.emit({
          type: 'validation-result',
          checkId: command.checkId,
          status: 'cancelled',
          cases: [],
          message: 'Validation cancelled',
        }),
      );
    }
  }
  subscribe(listener: (value: unknown) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit(value: unknown): void {
    for (const listener of this.listeners) listener(value);
  }
  dispose(): void {
    this.disposed = true;
    this.onDispose?.();
  }
}

function channelAt(
  channels: readonly FakeChannel[],
  index: number,
): FakeChannel {
  const channel = channels[index];
  if (!channel) throw new Error('Missing test channel');
  return channel;
}

const definition: ValidationDefinition = {
  cases: [
    {
      id: 'normal',
      label: 'Normal',
      feedback: 'Try normal again',
      mode: 'value-test',
      expected: 2,
    },
    {
      id: 'boundary',
      label: 'Boundary',
      feedback: 'Try boundary again',
      mode: 'value-test',
      expected: 0,
    },
  ],
};

async function start(
  strategy: JavaScriptValidationStrategy,
  channel: FakeChannel,
) {
  const pending = strategy.validate({ source: 'return 2', definition });
  await vi.waitFor(() =>
    expect(channel.commands.some((item) => item.type === 'validate')).toBe(
      true,
    ),
  );
  const id = channel.commands.find((item) => item.type === 'validate')?.checkId;
  if (!id) throw new Error('Missing check ID');
  return { pending, id };
}

describe('JavaScriptValidationStrategy', () => {
  it('rejects invalid definitions before opening a channel', async () => {
    const channel = new FakeChannel();
    const strategy = new JavaScriptValidationStrategy(
      'https://runner.test',
      () => channel,
    );
    const result = await strategy.validate({
      source: 'return 1',
      definition: { cases: [] },
    });
    expect(result.status).toBe('invalid-definition');
    expect(channel.commands).toHaveLength(0);
  });

  it('accepts only correlated ordered results and uses authored feedback', async () => {
    const channel = new FakeChannel();
    const strategy = new JavaScriptValidationStrategy(
      'https://runner.test',
      () => channel,
    );
    const { pending, id } = await start(strategy, channel);
    channel.emit({
      type: 'validation-result',
      checkId: 'old',
      status: 'completed',
      message: '',
      cases: [],
    });
    channel.emit({
      type: 'validation-result',
      checkId: id,
      status: 'completed',
      message: '',
      cases: [
        { id: 'normal', status: 'completed', passed: true },
        { id: 'boundary', status: 'completed', passed: false },
      ],
    });
    await expect(pending).resolves.toMatchObject({
      passed: false,
      failedCaseIds: ['boundary'],
      cases: [
        { status: 'passed' },
        { status: 'failed', message: 'Try boundary again' },
      ],
    });
    expect(channel.disposed).toBe(true);
  });

  it('fails malformed active packets and recovers on a new channel', async () => {
    const channels = [new FakeChannel(), new FakeChannel()];
    let index = 0;
    const strategy = new JavaScriptValidationStrategy(
      'https://runner.test',
      () => channelAt(channels, index++),
    );
    const first = await start(strategy, channelAt(channels, 0));
    channelAt(channels, 0).emit({
      type: 'validation-result',
      checkId: first.id,
      status: 'completed',
      message: '',
      cases: [{ id: 'wrong', status: 'completed', passed: true }],
    });
    await expect(first.pending).resolves.toMatchObject({
      status: 'internal-error',
      passed: false,
    });
    const second = await start(strategy, channelAt(channels, 1));
    channelAt(channels, 1).emit({
      type: 'validation-result',
      checkId: second.id,
      status: 'completed',
      message: '',
      cases: [
        { id: 'normal', status: 'completed', passed: true },
        { id: 'boundary', status: 'completed', passed: true },
      ],
    });
    await expect(second.pending).resolves.toMatchObject({
      status: 'completed',
      passed: true,
    });
  });

  it('cancels and ignores late packets', async () => {
    const channel = new FakeChannel();
    const strategy = new JavaScriptValidationStrategy(
      'https://runner.test',
      () => channel,
    );
    const { pending, id } = await start(strategy, channel);
    await strategy.cancel();
    channel.emit({
      type: 'validation-result',
      checkId: id,
      status: 'completed',
      message: '',
      cases: [],
    });
    await expect(pending).resolves.toMatchObject({
      status: 'cancelled',
      passed: false,
    });
    expect(channel.disposed).toBe(true);
  });

  it('supersedes an active check and rejects oversized active packets', async () => {
    const channels = [new FakeChannel(), new FakeChannel()];
    let index = 0;
    const strategy = new JavaScriptValidationStrategy(
      'https://runner.test',
      () => channelAt(channels, index++),
    );
    const first = await start(strategy, channelAt(channels, 0));
    const second = await start(strategy, channelAt(channels, 1));
    await expect(first.pending).resolves.toMatchObject({ status: 'cancelled' });
    channelAt(channels, 0).emit({
      type: 'validation-result',
      checkId: first.id,
      status: 'completed',
      message: '',
      cases: [],
    });
    channelAt(channels, 1).emit({
      type: 'validation-result',
      checkId: second.id,
      status: 'completed',
      message: 'x'.repeat(16_385),
      cases: [],
    });
    await expect(second.pending).resolves.toMatchObject({
      status: 'internal-error',
      passed: false,
    });
  });

  it('cancels during the runner handshake without dispatching source', async () => {
    let rejectReady: ((reason: Error) => void) | undefined;
    const ready = new Promise<void>((_resolve, reject) => {
      rejectReady = reject;
    });
    const channel = new FakeChannel(ready, () =>
      rejectReady?.(new Error('disposed')),
    );
    const create = vi.fn(() => channel);
    const strategy = new JavaScriptValidationStrategy(
      'https://runner.test',
      create,
    );
    const controller = new AbortController();
    const pending = strategy.validate({
      source: 'return 2',
      definition,
      signal: controller.signal,
    });
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    controller.abort();
    await expect(pending).resolves.toMatchObject({
      status: 'cancelled',
      passed: false,
    });
    expect(channel.commands.some((item) => item.type === 'validate')).toBe(
      false,
    );
    expect(channel.disposed).toBe(true);
  });
});
