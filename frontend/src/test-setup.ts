import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

if (typeof Range !== 'undefined') {
  Range.prototype.getClientRects ??= () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect ??= () => new DOMRect();
}

afterEach(() => {
  cleanup();
});
