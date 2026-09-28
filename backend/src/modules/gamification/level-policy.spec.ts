import { describe, expect, it } from 'vitest';
import { deriveLevel, PROVISIONAL_LEVEL_POLICY } from './level-policy';

describe('provisional derived level curve', () => {
  it.each([
    [0, 1, 0, 100, 0, 100],
    [99, 1, 0, 100, 99, 1],
    [100, 2, 100, 200, 0, 100],
    [235, 3, 200, 300, 35, 65],
    [10_000, 101, 10_000, 10_100, 0, 100],
  ])(
    'derives level boundaries for %i XP',
    (totalXp, level, start, next, into, remaining) => {
      expect(deriveLevel(totalXp)).toEqual({
        level,
        levelStartXp: start,
        nextLevelAtXp: next,
        xpIntoLevel: into,
        xpToNextLevel: remaining,
        curveId: 'provisional-linear-100-v1',
        curveProvisional: true,
      });
    },
  );

  it('accepts an explicit curve policy without storing level state', () => {
    expect(
      deriveLevel(75, {
        id: 'review-candidate',
        xpPerLevel: 50,
        provisional: true,
      }),
    ).toMatchObject({
      level: 2,
      xpIntoLevel: 25,
      xpToNextLevel: 25,
      curveId: 'review-candidate',
    });
    expect(PROVISIONAL_LEVEL_POLICY.xpPerLevel).toBe(100);
  });

  it.each([-1, 0.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid total %s',
    (totalXp) => expect(() => deriveLevel(totalXp)).toThrow(RangeError),
  );
});
