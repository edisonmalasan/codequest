import { describe, expect, it } from 'vitest';
import { getPort } from './config';

describe('getPort', () => {
  it('defaults to 3001 when PORT is unset', () => {
    expect(getPort({})).toBe(3001);
  });

  it('accepts a valid custom port', () => {
    expect(getPort({ PORT: '4000' })).toBe(4000);
  });

  it('rejects non-numeric, out-of-range, and empty ports', () => {
    expect(() => getPort({ PORT: 'abc' })).toThrow();
    expect(() => getPort({ PORT: '0' })).toThrow();
    expect(() => getPort({ PORT: '65536' })).toThrow();
    expect(() => getPort({ PORT: '' })).toThrow();
  });
});
