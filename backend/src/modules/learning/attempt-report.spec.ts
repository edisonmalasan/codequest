import { describe, expect, it } from 'vitest';
import { normalizeAttemptReport } from './attempt-report';
import type { CurriculumCase } from '../curriculum/content/content-schema';

const cases: CurriculumCase[] = [
  {
    id: 'normal-message',
    kind: 'console',
    category: 'normal',
    expectedOutput: 'hello',
    feedback: 'Try again',
  },
  {
    id: 'boundary-message',
    kind: 'console',
    category: 'boundary',
    expectedOutput: 'hello',
    feedback: 'Try again',
  },
];
const report = {
  checkId: '00000000-0000-4000-8000-000000000001',
  status: 'completed',
  passed: true,
  cases: [
    {
      id: 'normal-message',
      label: 'Normal',
      status: 'passed',
      message: 'Passed',
    },
    {
      id: 'boundary-message',
      label: 'Boundary',
      status: 'passed',
      message: 'Passed',
    },
  ],
  failedCaseIds: [],
  feedback: 'All passed',
  durationMs: 4,
};

describe('submission report policy', () => {
  it('accepts complete published case coverage', () => {
    expect(normalizeAttemptReport(report, cases).passed).toBe(true);
  });

  it('rejects client pass with omitted, reordered, or failed cases', () => {
    expect(() =>
      normalizeAttemptReport(
        { ...report, cases: report.cases.slice(0, 1) },
        cases,
      ),
    ).toThrow();
    expect(() =>
      normalizeAttemptReport(
        { ...report, cases: [...report.cases].reverse() },
        cases,
      ),
    ).toThrow();
    expect(() =>
      normalizeAttemptReport(
        {
          ...report,
          cases: [report.cases[0], { ...report.cases[1], status: 'failed' }],
        },
        cases,
      ),
    ).toThrow();
  });

  it('rejects client authority and oversized feedback', () => {
    expect(() =>
      normalizeAttemptReport({ ...report, accepted: true }, cases),
    ).toThrow();
    expect(() =>
      normalizeAttemptReport({ ...report, feedback: 'x'.repeat(513) }, cases),
    ).toThrow();
    expect(() =>
      normalizeAttemptReport({ ...report, status: 'timeout' }, cases),
    ).toThrow();
  });

  it('accepts a completed failed result with matching failed IDs', () => {
    const failed = {
      ...report,
      passed: false,
      cases: [report.cases[0], { ...report.cases[1], status: 'failed' }],
      failedCaseIds: ['boundary-message'],
    };
    expect(normalizeAttemptReport(failed, cases).passed).toBe(false);
  });
});
