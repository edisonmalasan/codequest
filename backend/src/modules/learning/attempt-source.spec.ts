import { describe, expect, it } from 'vitest';
import { validateAttemptSource } from './attempt-source';

const snapshot = {
  metadata: { contentVersion: '1.0.0', assessmentVersion: '2.0.0' },
  exercise: {
    schemaVersion: 1 as const,
    mode: 'static-web' as const,
    files: [
      {
        id: 'page',
        name: 'index.html',
        language: 'html' as const,
        starterFile: 'starter.html' as const,
        starterSource: '<h1>Start</h1>',
      },
      {
        id: 'style',
        name: 'style.css',
        language: 'css' as const,
        starterFile: 'starter.css' as const,
        starterSource: 'h1 { color: blue; }',
      },
    ],
  },
};

function source(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    schemaVersion: 1,
    questId: 'WEB01',
    contentVersion: '1.0.0',
    assessmentVersion: '2.0.0',
    mode: 'static-web',
    files: [
      { id: 'page', language: 'html', source: '<h1>Current</h1>' },
      { id: 'style', language: 'css', source: 'h1 { color: red; }' },
    ],
    ...overrides,
  });
}

describe('private multi-file source snapshots', () => {
  it('accepts only an exact canonical current descriptor and preserves legacy strings', () => {
    expect(() =>
      validateAttemptSource(source(), 'WEB01', snapshot),
    ).not.toThrow();
    expect(() =>
      validateAttemptSource('console.log(1)', 'Q01', {
        metadata: snapshot.metadata,
      }),
    ).not.toThrow();
    expect(() => validateAttemptSource(source(), 'OTHER', snapshot)).toThrow(
      'Exercise source does not match',
    );
  });

  it('rejects stale, extra, duplicate, reordered and oversized files before persistence', () => {
    expect(() =>
      validateAttemptSource(
        source({ contentVersion: '0.9.0' }),
        'WEB01',
        snapshot,
      ),
    ).toThrow();
    const files = JSON.parse(source()).files;
    expect(() =>
      validateAttemptSource(
        source({ files: [files[0], files[0]] }),
        'WEB01',
        snapshot,
      ),
    ).toThrow();
    expect(() =>
      validateAttemptSource(
        source({
          files: [
            ...files,
            { id: 'extra', language: 'javascript', source: '' },
          ],
        }),
        'WEB01',
        snapshot,
      ),
    ).toThrow();
    expect(() =>
      validateAttemptSource(
        source({ files: [...files].reverse() }),
        'WEB01',
        snapshot,
      ),
    ).toThrow();
    expect(() =>
      validateAttemptSource(
        source({
          files: [files[0], { ...files[1], source: 'x'.repeat(65_536) }],
        }),
        'WEB01',
        snapshot,
      ),
    ).toThrow();
    expect(() =>
      validateAttemptSource(`${source()} `, 'WEB01', snapshot),
    ).toThrow('Invalid exercise source bundle');
    expect(() => validateAttemptSource('{', 'WEB01', snapshot)).toThrow(
      'Invalid exercise source bundle',
    );
  });
});
