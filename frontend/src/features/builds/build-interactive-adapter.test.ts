import { describe, expect, it, vi } from 'vitest';
import type {
  InteractiveResult,
  InteractiveWebAdapter,
} from '@/features/interactive';
import { BoundedBuildAdapter } from './build-interactive-adapter';
import { BUILD_STARTER_FILES } from './build-starter';

const ready: InteractiveResult = {
  generationId: 'ready',
  status: 'ready',
  message: 'Ready',
  output: [],
  filteredActiveContent: false,
  description: '',
  durationMs: 0,
};

function fakeAdapter() {
  const start = vi.fn(async () => ready);
  const cancel = vi.fn(async () => undefined);
  const underlying: InteractiveWebAdapter = {
    attach: vi.fn(),
    subscribe: vi.fn(() => () => undefined),
    start,
    dispatch: vi.fn(async () => ready),
    reload: vi.fn(async () => ready),
    readText: vi.fn(() => null),
    cancel,
    dispose: vi.fn(async () => undefined),
  };
  return { start, cancel, adapter: new BoundedBuildAdapter(underlying) };
}

describe('Build Run boundary', () => {
  it('passes a validated fixed manifest to the isolated adapter', async () => {
    const { adapter, start } = fakeAdapter();
    const files = BUILD_STARTER_FILES.map((file) => ({
      id: file.id,
      language: file.language,
      source: file.starterSource,
    }));
    await expect(
      adapter.start({ contentVersion: 'ignored', files }),
    ).resolves.toEqual(ready);
    expect(start).toHaveBeenCalledWith(
      expect.objectContaining({ contentVersion: 'build-web-v1' }),
      undefined,
    );
  });

  it('cancels an old run and rejects unsupported files before execution', async () => {
    const { adapter, start, cancel } = fakeAdapter();
    const files = BUILD_STARTER_FILES.map((file) => ({
      id: file.id,
      language: file.language,
      source: file.starterSource,
    }));
    files[0] = { ...files[0], id: 'foreign.html' };
    await expect(
      adapter.start({ contentVersion: 'ignored', files }),
    ).resolves.toMatchObject({
      status: 'unsupported',
    });
    expect(cancel).toHaveBeenCalledOnce();
    expect(start).not.toHaveBeenCalled();
  });
});
