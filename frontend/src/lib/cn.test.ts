import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('merges class names and ignores falsy inputs', () => {
    expect(cn('px-2', false, undefined, 'py-1')).toBe('px-2 py-1');
  });

  it('resolves conflicting Tailwind classes deterministically', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
