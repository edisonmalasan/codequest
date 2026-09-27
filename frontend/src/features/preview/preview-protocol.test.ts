import { describe, expect, it } from 'vitest';

import { classifyPreviewResponse } from './preview-protocol';

describe('preview response protocol', () => {
  const id = 'generation-current';

  it('accepts only one exact ready packet for the current generation', () => {
    const packet = { type: 'ready', generationId: id };
    expect(classifyPreviewResponse(packet, id, false)).toBe('ready');
    expect(classifyPreviewResponse(packet, id, true)).toBe('invalid');
    expect(
      classifyPreviewResponse({ ...packet, extra: 'data' }, id, false),
    ).toBe('invalid');
  });

  it('discards stale packets and rejects malformed, oversized, and unknown active packets', () => {
    expect(
      classifyPreviewResponse(
        { type: 'ready', generationId: 'old' },
        id,
        false,
      ),
    ).toBe('stale');
    expect(classifyPreviewResponse({ type: 'ready' }, id, false)).toBe('stale');
    expect(
      classifyPreviewResponse({ type: 'other', generationId: id }, id, false),
    ).toBe('invalid');
    expect(
      classifyPreviewResponse(
        { type: 'ready', generationId: id, text: 'x'.repeat(150_000) },
        id,
        false,
      ),
    ).toBe('invalid');
    expect(classifyPreviewResponse(null, id, false)).toBe('invalid');
    expect(classifyPreviewResponse(['ready', id], id, false)).toBe('invalid');
  });
});
