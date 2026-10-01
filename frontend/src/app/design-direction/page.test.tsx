import { describe, expect, it, vi } from 'vitest';
import DesignDirectionPage from './page';

const notFound = vi.fn(() => {
  throw new Error('not found');
});
vi.mock('next/navigation', () => ({ notFound: () => notFound() }));

describe('DesignDirectionPage', () => {
  it('is absent in production', () => {
    const previous = process.env.NODE_ENV;
    vi.stubEnv('NODE_ENV', 'production');
    try {
      expect(() => DesignDirectionPage()).toThrow('not found');
      expect(notFound).toHaveBeenCalled();
    } finally {
      vi.stubEnv('NODE_ENV', previous);
    }
  });
});
