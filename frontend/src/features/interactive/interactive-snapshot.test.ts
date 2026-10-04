import { describe, expect, it } from 'vitest';
import {
  captureInteractiveSnapshot,
  InteractiveSourceError,
  resolveInteractiveOrigins,
} from './interactive-snapshot';
import type { PreviewFile } from '@/features/preview';

function validFiles(): PreviewFile[] {
  return [
    { id: 'page', language: 'html', source: '<h1 id="title">Hi</h1>' },
    {
      id: 'logic',
      language: 'javascript',
      source: "document.getElementById('title').textContent = 'Ready'",
    },
  ];
}

describe('interactive snapshot boundary', () => {
  it('captures an immutable versioned file snapshot', () => {
    const files = validFiles();
    const captured = captureInteractiveSnapshot({
      contentVersion: 'q01:3',
      files,
    });
    files[0] = { id: 'page', language: 'html', source: '<h1>Changed</h1>' };
    expect(captured.html).toBe('<h1 id="title">Hi</h1>');
    expect(captured.contentVersion).toBe('q01:3');
    expect(Object.isFrozen(captured.files)).toBe(true);
    expect(Object.isFrozen(captured.files[0])).toBe(true);
  });

  it('rejects duplicate identities, unsupported language, and missing entry files', () => {
    const html = { id: 'same', language: 'html' as const, source: '<p>Hi</p>' };
    const javascript = {
      id: 'same',
      language: 'javascript' as const,
      source: '',
    };
    expect(() =>
      captureInteractiveSnapshot({
        contentVersion: 'v1',
        files: [html, javascript],
      }),
    ).toThrow(InteractiveSourceError);
    const unsupported = { ...javascript, id: 'logic' };
    Reflect.set(unsupported, 'language', 'python');
    expect(() =>
      captureInteractiveSnapshot({
        contentVersion: 'v1',
        files: [html, unsupported],
      }),
    ).toThrow(InteractiveSourceError);
    expect(() =>
      captureInteractiveSnapshot({ contentVersion: 'v1', files: [html] }),
    ).toThrow(InteractiveSourceError);
  });

  it('rejects invalid versions and oversized UTF-8 source before delivery', () => {
    expect(() =>
      captureInteractiveSnapshot({
        contentVersion: '../bad',
        files: validFiles(),
      }),
    ).toThrow(InteractiveSourceError);
    expect(() =>
      captureInteractiveSnapshot({
        contentVersion: 'v1',
        files: [
          { id: 'page', language: 'html', source: '🚀'.repeat(16_385) },
          { id: 'logic', language: 'javascript', source: '' },
        ],
      }),
    ).toThrow(InteractiveSourceError);
  });

  it('requires three separate eligible origins with no unsafe fallback', () => {
    expect(
      resolveInteractiveOrigins(
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://127.0.0.2:3000',
      ),
    ).toEqual({
      runnerOrigin: 'http://127.0.0.1:3000',
      previewOrigin: 'http://127.0.0.2:3000',
    });
    expect(
      resolveInteractiveOrigins(
        'http://localhost:3000',
        'http://localhost:3000',
        'http://127.0.0.2:3000',
      ),
    ).toBeNull();
    expect(
      resolveInteractiveOrigins(
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3000',
      ),
    ).toBeNull();
    expect(
      resolveInteractiveOrigins(
        'https://app.example.test',
        'http://runtime.example.test',
        'https://preview.example.test',
      ),
    ).toBeNull();
  });
});
