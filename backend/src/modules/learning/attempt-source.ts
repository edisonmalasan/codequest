import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import type { CatalogQuestSnapshot } from '../curriculum/content/curriculum-catalog';

type SourceSnapshot = {
  readonly metadata: {
    readonly contentVersion: string;
    readonly assessmentVersion: string;
  };
  readonly exercise?: CatalogQuestSnapshot['exercise'];
};

const file = z
  .object({
    id: z.string(),
    language: z.enum(['html', 'css', 'javascript']),
    source: z.string(),
  })
  .strict();
const bundle = z
  .object({
    schemaVersion: z.literal(1),
    questId: z.string(),
    contentVersion: z.string(),
    assessmentVersion: z.string(),
    mode: z.enum(['static-web', 'interactive-web']),
    files: z.array(file).min(1).max(3),
  })
  .strict();

export function validateAttemptSource(
  source: string,
  questId: string,
  snapshot: SourceSnapshot,
): void {
  if (Buffer.byteLength(source, 'utf8') > 65_536)
    throw new BadRequestException('Source exceeds limit');
  const exercise = snapshot.exercise;
  if (!exercise || exercise.mode === 'javascript') return;
  let raw: unknown;
  try {
    raw = JSON.parse(source);
  } catch {
    throw new BadRequestException('Invalid exercise source bundle');
  }
  const parsed = bundle.safeParse(raw);
  if (!parsed.success || JSON.stringify(parsed.data) !== source)
    throw new BadRequestException('Invalid exercise source bundle');
  const value = parsed.data;
  if (
    value.questId !== questId ||
    value.contentVersion !== snapshot.metadata.contentVersion ||
    value.assessmentVersion !== snapshot.metadata.assessmentVersion ||
    value.mode !== exercise.mode ||
    value.files.length !== exercise.files.length ||
    value.files.some(
      (entry, index) =>
        entry.id !== exercise.files[index].id ||
        entry.language !== exercise.files[index].language ||
        Buffer.byteLength(entry.source, 'utf8') >
          (entry.language === 'css' ? 32_768 : 65_536),
    )
  )
    throw new BadRequestException(
      'Exercise source does not match published files',
    );
}
