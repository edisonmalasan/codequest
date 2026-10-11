import { describe, expect, it } from 'vitest';
import { decodeDisplayPacket, decodeRunnerStep } from './interactive-protocol';

const nodes = new Set(['n0']);

describe('interactive correlated packets', () => {
  it('accepts only the current session and step with bounded text mutations', () => {
    const step = {
      type: 'step',
      sessionId: 'current',
      stepId: 'first',
      status: 'ready',
      message: '',
      output: ['done'],
      mutations: [{ nodeId: 'n0', kind: 'text', value: 'Safe' }],
    };
    expect(
      decodeRunnerStep(step, 'current', 'first', nodes)?.mutations,
    ).toHaveLength(1);
    expect(decodeRunnerStep(step, 'old', 'first', nodes)).toBeNull();
    expect(decodeRunnerStep(step, 'current', 'old', nodes)).toBeNull();
    expect(
      decodeRunnerStep(
        {
          ...step,
          mutations: [
            {
              nodeId: 'n0',
              kind: 'attribute',
              name: 'onclick',
              value: 'alert(1)',
            },
          ],
        },
        'current',
        'first',
        nodes,
      ),
    ).toBeNull();
    expect(
      decodeRunnerStep(
        {
          ...step,
          mutations: [{ nodeId: 'n1', kind: 'text', value: 'wrong node' }],
        },
        'current',
        'first',
        nodes,
      ),
    ).toBeNull();
    expect(
      decodeRunnerStep(
        { ...step, output: ['x'.repeat(13_000)] },
        'current',
        'first',
        nodes,
      ),
    ).toBeNull();
  });

  it('rejects stale, forged, oversized, and wrong-node display events', () => {
    expect(
      decodeDisplayPacket(
        { type: 'event-limit', generationId: 'current' },
        'current',
        nodes,
      ),
    ).toMatchObject({ type: 'event-limit' });
    expect(
      decodeDisplayPacket(
        { type: 'event-limit', generationId: 'old' },
        'current',
        nodes,
      ),
    ).toBeNull();
    const packet = {
      type: 'interaction',
      generationId: 'current',
      eventId: 'e1',
      event: { type: 'click', targetId: 'n0' },
    };
    expect(decodeDisplayPacket(packet, 'current', nodes)?.type).toBe(
      'interaction',
    );
    expect(decodeDisplayPacket(packet, 'old', nodes)).toBeNull();
    expect(
      decodeDisplayPacket(
        { ...packet, event: { type: 'click', targetId: 'n1' } },
        'current',
        nodes,
      ),
    ).toBeNull();
    expect(
      decodeDisplayPacket(
        {
          ...packet,
          event: { type: 'click', targetId: 'n0', value: 'x'.repeat(257) },
        },
        'current',
        nodes,
      ),
    ).toBeNull();
    expect(
      decodeDisplayPacket({ ...packet, extra: true }, 'current', nodes),
    ).toBeNull();
  });
});
