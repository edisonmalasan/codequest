import { describe, expect, it } from 'vitest';

type Evidence = 'backend_fact' | 'client_observed' | 'app_open';
interface FixtureEvent {
  readonly eventId: string;
  readonly learner: string;
  readonly atHours: number;
  readonly name: string;
  readonly evidence: Evidence;
  readonly questId?: string;
}

const events: readonly FixtureEvent[] = [
  {
    eventId: 'a-start',
    learner: 'A',
    atHours: 0,
    name: 'signup_completed',
    evidence: 'backend_fact',
  },
  {
    eventId: 'a-run',
    learner: 'A',
    atHours: 1,
    name: 'first_code_run',
    evidence: 'client_observed',
  },
  {
    eventId: 'a-code-run',
    learner: 'A',
    atHours: 1,
    name: 'code_run',
    evidence: 'client_observed',
  },
  {
    eventId: 'a-q01',
    learner: 'A',
    atHours: 2,
    name: 'quest_completed',
    evidence: 'backend_fact',
    questId: 'Q01',
  },
  {
    eventId: 'a-q01',
    learner: 'A',
    atHours: 2,
    name: 'quest_completed',
    evidence: 'backend_fact',
    questId: 'Q01',
  },
  {
    eventId: 'a-q02',
    learner: 'A',
    atHours: 3,
    name: 'quest_completed',
    evidence: 'backend_fact',
    questId: 'Q02',
  },
  {
    eventId: 'a-return',
    learner: 'A',
    atHours: 26,
    name: 'quest_attempted',
    evidence: 'backend_fact',
  },
  {
    eventId: 'b-start',
    learner: 'B',
    atHours: 0,
    name: 'signup_completed',
    evidence: 'backend_fact',
  },
  {
    eventId: 'b-run',
    learner: 'B',
    atHours: 1,
    name: 'first_code_run',
    evidence: 'client_observed',
  },
  {
    eventId: 'b-open',
    learner: 'B',
    atHours: 27,
    name: 'app_open',
    evidence: 'app_open',
  },
  {
    eventId: 'c-start',
    learner: 'C',
    atHours: 0,
    name: 'signup_completed',
    evidence: 'backend_fact',
  },
  {
    eventId: 'c-run',
    learner: 'C',
    atHours: 1,
    name: 'first_code_run',
    evidence: 'client_observed',
  },
  ...['Q01', 'Q02', 'Q03', 'Q04', 'Q05'].map((questId, index) => ({
    eventId: `c-${questId}`,
    learner: 'C',
    atHours: index + 2,
    name: 'quest_completed',
    evidence: 'backend_fact' as const,
    questId,
  })),
  {
    eventId: 'c-return',
    learner: 'C',
    atHours: 30,
    name: 'quest_attempted',
    evidence: 'backend_fact',
  },
  {
    eventId: 'c-d7',
    learner: 'C',
    atHours: 170,
    name: 'quest_attempted',
    evidence: 'backend_fact',
  },
  {
    eventId: 'g-start',
    learner: 'G',
    atHours: 0,
    name: 'first_quest_started',
    evidence: 'client_observed',
  },
  {
    eventId: 'g-first',
    learner: 'G',
    atHours: 1,
    name: 'first_code_run',
    evidence: 'client_observed',
  },
  {
    eventId: 'g-later-check',
    learner: 'G',
    atHours: 27,
    name: 'validation_checked',
    evidence: 'client_observed',
  },
];

const qualifiedNames = new Set([
  'code_run',
  'validation_checked',
  'quest_attempted',
  'quest_completed',
]);

describe('documented analytics fixture', () => {
  it('deduplicates event and stable quest identity for five-quest progression', () => {
    const unique = [
      ...new Map(events.map((event) => [event.eventId, event])).values(),
    ];
    const completions = unique.filter(
      (event) =>
        event.name === 'quest_completed' && event.evidence === 'backend_fact',
    );
    const count = (learner: string) =>
      new Set(
        completions
          .filter((event) => event.learner === learner)
          .map((event) => event.questId),
      ).size;
    expect(count('A')).toBe(2);
    expect(count('C')).toBe(5);
    expect(['A', 'B', 'C'].filter((learner) => count(learner) >= 5)).toEqual([
      'C',
    ]);
  });

  it('counts qualified elapsed returns and excludes app opens', () => {
    const starters = ['A', 'B', 'C'];
    const returned = (from: number, to: number) =>
      starters.filter((learner) =>
        events.some(
          (event) =>
            event.learner === learner &&
            event.atHours >= from &&
            event.atHours <= to &&
            qualifiedNames.has(event.name) &&
            event.evidence !== 'app_open',
        ),
      );
    const fullWindow = (cutoff: number, end: number) =>
      starters.filter(() => cutoff >= end).length;
    expect({
      numerator: returned(24, 48).length,
      denominator: fullWindow(50, 48),
    }).toEqual({ numerator: 2, denominator: 3 });
    expect({
      numerator: returned(168, 192).length,
      denominator: fullWindow(200, 192),
    }).toEqual({ numerator: 1, denominator: 3 });
    expect(fullWindow(180, 192)).toBe(0);
    expect(
      events.some(
        (event) =>
          event.learner === 'G' &&
          event.atHours >= 24 &&
          event.atHours <= 48 &&
          event.name === 'validation_checked' &&
          event.evidence === 'client_observed',
      ),
    ).toBe(true);
  });
});
