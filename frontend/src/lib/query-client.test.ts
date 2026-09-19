import { describe, expect, it } from 'vitest';
import { createQueryClient, getQueryClient } from './query-client';

describe('query client foundation', () => {
  it('creates independent clients from the factory', () => {
    const first = createQueryClient();
    const second = createQueryClient();
    expect(first).not.toBe(second);
  });

  it('uses conservative defaults with no retries', () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.retry).toBe(false);
  });

  it('returns a stable browser client', () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });
});
