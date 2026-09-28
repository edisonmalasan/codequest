import { describe, expect, it } from 'vitest';
import {
  canCreditChangedTimezone,
  deriveStreak,
  localDate,
  validateTimezone,
} from './streak-policy';

describe('learner streak policy', () => {
  it('converts a server instant at an IANA-local midnight and rejects offsets', () => {
    expect(localDate(new Date('2026-09-28T16:00:00Z'), 'Asia/Manila')).toBe(
      '2026-09-29',
    );
    expect(localDate(new Date('2026-09-28T16:00:00Z'), 'UTC')).toBe(
      '2026-09-28',
    );
    expect(() => validateTimezone('+08:00')).toThrow();
    expect(() => validateTimezone('Invalid/Zone')).toThrow();
  });

  it('derives current and longest from dates without a mutable counter', () => {
    const days = [
      '2026-09-20',
      '2026-09-21',
      '2026-09-25',
      '2026-09-26',
      '2026-09-27',
    ];
    expect(deriveStreak(days, '2026-09-28')).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      latestActivityDate: '2026-09-27',
    });
    expect(deriveStreak(days, '2026-09-30').currentStreak).toBe(0);
    expect(deriveStreak([], '2026-09-28')).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      latestActivityDate: null,
    });
  });

  it('withholds rapid changed-zone credit but allows same-zone midnight', () => {
    const latest = {
      timezone: 'UTC',
      acceptedAt: new Date('2026-09-28T12:00:00Z'),
    };
    expect(
      canCreditChangedTimezone(
        latest,
        'Asia/Manila',
        new Date('2026-09-28T22:00:00Z'),
      ),
    ).toBe(false);
    expect(
      canCreditChangedTimezone(
        latest,
        'Asia/Manila',
        new Date('2026-09-29T12:00:00Z'),
      ),
    ).toBe(true);
    expect(
      canCreditChangedTimezone(latest, 'UTC', new Date('2026-09-29T00:01:00Z')),
    ).toBe(true);
  });
});
