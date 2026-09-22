import { describe, expect, it } from 'vitest';
import { safeReturnPath } from './return-path';

describe('safeReturnPath', () => {
  it.each([
    ['/account', '/account'],
    ['/account?tab=profile', '/account?tab=profile'],
    ['/journey/javascript', '/journey/javascript'],
  ])('keeps local application path %s', (value, expected) => {
    expect(safeReturnPath(value)).toBe(expected);
  });

  it.each([
    null,
    '',
    'https://attacker.example',
    '//attacker.example',
    '/\\attacker.example',
    '%2f%2fattacker.example',
    '/account%0d%0aSet-Cookie:token=secret',
    '%',
  ])('rejects unsafe destination %o', (value) => {
    expect(safeReturnPath(value)).toBe('/account');
  });
});
