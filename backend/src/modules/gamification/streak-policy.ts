import { BadRequestException } from '@nestjs/common';

const DAY_MS = 86_400_000;
const IANA_NAME = /^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)*$/;

export function validateTimezone(timezone: string): string {
  if (!IANA_NAME.test(timezone) || timezone.length > 128)
    throw new BadRequestException('Select a valid IANA timezone');
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
    }).resolvedOptions().timeZone;
  } catch {
    throw new BadRequestException('Select a valid IANA timezone');
  }
}

export function localDate(at: Date, timezone: string): string {
  validateTimezone(timezone);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(at);
  const part = (type: string): string =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function dayNumber(date: string): number {
  return Date.parse(`${date}T00:00:00.000Z`) / DAY_MS;
}

export function deriveStreak(
  dates: readonly string[],
  today: string,
): {
  currentStreak: number;
  longestStreak: number;
  latestActivityDate: string | null;
} {
  const ordered = [...new Set(dates)].sort();
  let longestStreak = 0;
  let run = 0;
  let previous: number | undefined;
  for (const date of ordered) {
    const current = dayNumber(date);
    run = previous !== undefined && current === previous + 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previous = current;
  }
  const latestActivityDate = ordered.at(-1) ?? null;
  const difference =
    previous === undefined ? Infinity : dayNumber(today) - previous;
  return {
    currentStreak: difference === 0 || difference === 1 ? run : 0,
    longestStreak,
    latestActivityDate,
  };
}

export function canCreditChangedTimezone(
  latest: { timezone: string; acceptedAt: Date } | undefined,
  timezone: string,
  acceptedAt: Date,
): boolean {
  return (
    latest === undefined ||
    latest.timezone === timezone ||
    acceptedAt.getTime() - latest.acceptedAt.getTime() >= DAY_MS
  );
}
