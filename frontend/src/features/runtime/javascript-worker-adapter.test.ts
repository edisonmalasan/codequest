import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BootstrapChannel, BootstrapCommand } from './bootstrap-channel';
import { EXECUTION_LIMITS } from './execution-types';
import { JavaScriptWorkerAdapter } from './javascript-worker-adapter';

class FakeChannel implements BootstrapChannel {
  readonly commands: BootstrapCommand[] = [];
  private readonly listeners = new Set<(message: unknown) => void>();
  disposed = false;

  constructor(readonly ready: Promise<void> = Promise.resolve()) {}

  post(command: BootstrapCommand): void {
    this.commands.push(command);
  }

  subscribe(listener: (message: unknown) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(message: unknown): void {
    for (const listener of this.listeners) listener(message);
  }

  dispose(): void {
    this.disposed = true;
  }
}

function terminal(runId: string, status = 'success') {
  return {
    type: 'result',
    runId,
    status,
    output: ['hello'],
    value: '42',
    message: '',
  };
}

async function currentRun(channel: FakeChannel): Promise<string> {
  await vi.waitFor(() => {
    expect(channel.commands.some((command) => command.type === 'execute')).toBe(
      true,
    );
  });
  const command = channel.commands.findLast(
    (candidate) => candidate.type === 'execute',
  );
  if (command?.runId === undefined) throw new Error('Run command missing');
  return command.runId;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('JavaScriptWorkerAdapter', () => {
  it('returns safe unavailable and source-limit results without dispatch', async () => {
    const unavailable = new JavaScriptWorkerAdapter(null);
    expect((await unavailable.execute({ source: 'return 1' })).status).toBe(
      'internal-error',
    );

    const channel = new FakeChannel();
    const adapter = new JavaScriptWorkerAdapter(
      'https://runner.example.test',
      () => channel,
    );
    const oversized = await adapter.execute({
      source: 'x'.repeat(EXECUTION_LIMITS.sourceBytes + 1),
    });
    expect(oversized.status).toBe('output-limit');
    expect(channel.commands).toHaveLength(0);
  });

  it('resolves a correlated bounded terminal result', async () => {
    const channel = new FakeChannel();
    const adapter = new JavaScriptWorkerAdapter(
      'https://runner.example.test',
      () => channel,
    );
    const pending = adapter.execute({
      source: 'console.log("hello"); return 42',
    });
    const runId = await currentRun(channel);
    channel.emit(terminal(runId));
    await expect(pending).resolves.toMatchObject({
      runId,
      status: 'success',
      output: ['hello'],
      value: '42',
    });
  });

  it('ignores stale output and fails malformed active output', async () => {
    const channel = new FakeChannel();
    const adapter = new JavaScriptWorkerAdapter(
      'https://runner.example.test',
      () => channel,
    );
    const pending = adapter.execute({ source: 'return 1' });
    const runId = await currentRun(channel);
    channel.emit(terminal('stale'));
    channel.emit({ type: 'result', runId, status: 'passed' });
    await expect(pending).resolves.toMatchObject({ status: 'internal-error' });
    expect(channel.commands.at(-1)).toMatchObject({ type: 'cancel', runId });
  });

  it('maps acknowledged abort and watchdog cleanup to terminal states', async () => {
    const channel = new FakeChannel();
    const adapter = new JavaScriptWorkerAdapter(
      'https://runner.example.test',
      () => channel,
    );
    const controller = new AbortController();
    const cancelled = adapter.execute({
      source: 'while(true){}',
      signal: controller.signal,
    });
    const cancelledId = await currentRun(channel);
    controller.abort();
    await vi.waitFor(() =>
      expect(channel.commands.at(-1)).toMatchObject({
        type: 'cancel',
        runId: cancelledId,
      }),
    );
    channel.emit(terminal(cancelledId, 'cancelled'));
    await expect(cancelled).resolves.toMatchObject({ status: 'cancelled' });

    vi.useFakeTimers();
    const executeCount = channel.commands.filter(
      (command) => command.type === 'execute',
    ).length;
    const timedOut = adapter.execute({ source: 'while(true){}' });
    for (let index = 0; index < 10; index += 1) await Promise.resolve();
    expect(
      channel.commands.filter((command) => command.type === 'execute'),
    ).toHaveLength(executeCount + 1);
    const timeoutId = channel.commands.findLast(
      (command) => command.type === 'execute',
    )?.runId;
    expect(timeoutId).toBeDefined();
    await vi.advanceTimersByTimeAsync(EXECUTION_LIMITS.deadlineMs);
    channel.emit(terminal(timeoutId ?? '', 'cancelled'));
    await expect(timedOut).resolves.toMatchObject({ status: 'timeout' });
  });

  it('cancels a superseded run before dispatching the next run', async () => {
    const channel = new FakeChannel();
    const adapter = new JavaScriptWorkerAdapter(
      'https://runner.example.test',
      () => channel,
    );
    const first = adapter.execute({ source: 'while(true){}' });
    const firstId = await currentRun(channel);
    const second = adapter.execute({ source: 'return 2' });
    await vi.waitFor(() =>
      expect(channel.commands.at(-1)).toMatchObject({
        type: 'cancel',
        runId: firstId,
      }),
    );
    channel.emit(terminal(firstId, 'cancelled'));
    await expect(first).resolves.toMatchObject({ status: 'cancelled' });
    const secondId = await currentRun(channel);
    expect(secondId).not.toBe(firstId);
    channel.emit(terminal(secondId));
    await expect(second).resolves.toMatchObject({ status: 'success' });
  });

  it('ignores a duplicate completion while a later run is active', async () => {
    const channel = new FakeChannel();
    const adapter = new JavaScriptWorkerAdapter(
      'https://runner.example.test',
      () => channel,
    );
    const first = adapter.execute({ source: 'return 1' });
    const firstId = await currentRun(channel);
    channel.emit(terminal(firstId));
    await expect(first).resolves.toMatchObject({ status: 'success' });

    const second = adapter.execute({ source: 'return 2' });
    await vi.waitFor(() => {
      expect(
        channel.commands.filter((command) => command.type === 'execute'),
      ).toHaveLength(2);
    });
    const secondId = channel.commands.findLast(
      (command) => command.type === 'execute',
    )?.runId;
    if (secondId === undefined) throw new Error('Second run command missing');
    channel.emit(terminal(firstId));
    let settled = false;
    void second.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    channel.emit(terminal(secondId));
    await expect(second).resolves.toMatchObject({ runId: secondId });
  });

  it('recovers with a fresh channel after a handshake failure', async () => {
    const failed = new FakeChannel(
      Promise.reject(new Error('bootstrap unavailable')),
    );
    const recovered = new FakeChannel();
    const createChannel = vi
      .fn<() => BootstrapChannel>()
      .mockReturnValueOnce(failed)
      .mockReturnValueOnce(recovered);
    const adapter = new JavaScriptWorkerAdapter(
      'https://runner.example.test',
      createChannel,
    );

    await expect(
      adapter.execute({ source: 'return 1' }),
    ).resolves.toMatchObject({ status: 'internal-error' });
    expect(failed.disposed).toBe(true);

    const next = adapter.execute({ source: 'return 2' });
    const nextId = await currentRun(recovered);
    recovered.emit(terminal(nextId));
    await expect(next).resolves.toMatchObject({ status: 'success' });
  });
});
