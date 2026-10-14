import { describe, expect, it } from 'vitest';
import type { PreviewFile } from '@/features/preview';
import {
  BUILD_CONTENT_VERSION,
  BUILD_STARTER_FILES,
  validateBuildSnapshot,
} from './build-starter';

function starter(): PreviewFile[] {
  return BUILD_STARTER_FILES.map((file) => ({
    id: file.id,
    language: file.language,
    source: file.starterSource,
  }));
}

describe('reviewed Build manifest', () => {
  it('accepts and freezes the exact three-file starter for the interactive runner', () => {
    const captured = validateBuildSnapshot(starter());
    expect(captured.contentVersion).toBe(BUILD_CONTENT_VERSION);
    expect(captured.files.map((file) => file.id)).toEqual([
      'index.html',
      'style.css',
      'main.js',
    ]);
    expect(Object.isFrozen(captured.files)).toBe(true);
    expect(Object.isFrozen(captured.files[0])).toBe(true);
  });

  it('rejects missing, duplicated, extra, reordered, and unsupported files', () => {
    const files = starter();
    const unsupported = { ...files[1] };
    Reflect.set(unsupported, 'language', 'python');
    const invalid = [
      files.slice(0, 2),
      [...files, files[0]],
      [files[0], files[1], files[1]],
      [files[2], files[1], files[0]],
      [files[0], unsupported, files[2]],
      [files[0], { ...files[1], id: 'custom.css' }, files[2]],
    ];
    for (const candidate of invalid) {
      expect(() => validateBuildSnapshot(candidate)).toThrow();
    }
  });

  it('rejects source over the existing per-language byte limit', () => {
    const files = starter();
    files[1] = { ...files[1], source: '🚀'.repeat(8_193) };
    expect(() => validateBuildSnapshot(files)).toThrow(/limit/i);
  });
});
