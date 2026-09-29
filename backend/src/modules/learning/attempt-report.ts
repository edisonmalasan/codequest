import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import type { CurriculumCase } from '../curriculum/content/content-schema';

const caseResultSchema = z
  .object({
    id: z.string().min(1).max(48),
    label: z.string().max(512),
    status: z.enum(['passed', 'failed']),
    message: z.string().max(512),
  })
  .strict();

const reportSchema = z
  .object({
    checkId: z.uuid(),
    status: z.enum([
      'completed',
      'invalid-definition',
      'syntax-error',
      'runtime-error',
      'timeout',
      'output-limit',
      'cancelled',
      'internal-error',
    ]),
    passed: z.boolean(),
    cases: z.array(caseResultSchema).max(10),
    failedCaseIds: z.array(z.string().min(1).max(48)).max(10),
    feedback: z.string().max(512),
    durationMs: z.number().finite().min(0).max(10_000),
    capstoneResponses: z
      .object({ explanation: responseText(), transfer: responseText() })
      .strict()
      .optional(),
  })
  .strict();

export type NormalizedReport = z.infer<typeof reportSchema>;

function responseText() {
  return z
    .string()
    .min(1)
    .max(2000)
    .refine((value) => value.trim().length > 0, 'Response is blank')
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 4000,
      'Response exceeds limit',
    );
}

export function requireQuestResponses(
  report: NormalizedReport,
  kind: 'instructional' | 'capstone',
): void {
  if (kind === 'instructional' && report.capstoneResponses !== undefined)
    throw new BadRequestException(
      'Written responses are reserved for capstones',
    );
  if (kind === 'capstone' && report.passed && !report.capstoneResponses)
    throw new BadRequestException(
      'Capstone requires explanation and transfer responses',
    );
}

export function parseStoredReport(value: unknown): NormalizedReport {
  const parsed = reportSchema.safeParse(value);
  if (!parsed.success)
    throw new BadRequestException('Invalid validation report');
  return parsed.data;
}

export function normalizeAttemptReport(
  value: unknown,
  publishedCases: readonly CurriculumCase[],
): NormalizedReport {
  if (publishedCases.length > 10)
    throw new BadRequestException('Invalid validation report');
  const report = parseStoredReport(value);
  const ids = publishedCases.map((item) => item.id);
  const complete = report.status === 'completed';
  const caseIds = report.cases.map((item) => item.id);
  if (
    (complete &&
      (caseIds.length !== ids.length ||
        caseIds.some((id, index) => id !== ids[index]))) ||
    (!complete && report.passed) ||
    new Set(caseIds).size !== caseIds.length ||
    caseIds.some((id) => !ids.includes(id))
  )
    throw new BadRequestException('Invalid validation report');
  const failed = report.cases
    .filter((item) => item.status === 'failed')
    .map((item) => item.id);
  if (
    report.passed !== (complete && failed.length === 0) ||
    failed.length !== report.failedCaseIds.length ||
    failed.some((id, index) => id !== report.failedCaseIds[index])
  )
    throw new BadRequestException('Invalid validation report');
  return report;
}
