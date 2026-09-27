import { describe, expect, it } from 'vitest';

import { resolvePreviewOrigin } from './preview-origin';

describe('preview origin validation', () => {
  const app = 'https://app.example.test';
  const runner = 'https://runner.example.test';

  it('accepts a separate secure origin and loopback development origin', () => {
    expect(
      resolvePreviewOrigin('https://preview.example.test', app, runner),
    ).toBe('https://preview.example.test');
    expect(resolvePreviewOrigin('http://localhost:3101', app, runner)).toBe(
      'http://localhost:3101',
    );
  });

  it.each([
    undefined,
    'https://app.example.test',
    'https://runner.example.test',
    'http://preview.example.test',
    'https://preview.example.test/path',
    'https://user:password@preview.example.test',
    'https://preview.example.test/?query=1',
  ])('rejects unsafe origin %s', (configured) => {
    expect(resolvePreviewOrigin(configured, app, runner)).toBeNull();
  });
});
