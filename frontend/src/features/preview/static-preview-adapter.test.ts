// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';

import { StaticPreviewAdapter } from './static-preview-adapter';

const files = [
  { id: 'page', language: 'html' as const, source: '<h1>Safe</h1>' },
];

describe('static preview adapter startup lifecycle', () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('times out an unavailable bootstrap and removes its frame on disposal', async () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    document.body.append(host);
    const adapter = new StaticPreviewAdapter('https://preview.example.test');
    adapter.attach(host);
    const result = adapter.preview(files);
    await vi.advanceTimersByTimeAsync(1_001);
    expect((await result).status).toBe('unavailable');
    expect(host.querySelectorAll('iframe')).toHaveLength(0);
    await adapter.dispose();
  });

  it('invalidates a preview cancelled during the bootstrap handshake', async () => {
    vi.useFakeTimers();
    const host = document.createElement('div');
    document.body.append(host);
    const adapter = new StaticPreviewAdapter('https://preview.example.test');
    adapter.attach(host);
    const controller = new AbortController();
    const result = adapter.preview(files, controller.signal);
    controller.abort();
    await vi.advanceTimersByTimeAsync(1_001);
    expect((await result).status).toBe('cancelled');
    await adapter.dispose();
    expect(host.querySelectorAll('iframe')).toHaveLength(0);
  });
});
