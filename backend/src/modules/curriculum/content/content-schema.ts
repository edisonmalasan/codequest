import { z } from 'zod';

const id = z.string().regex(/^[A-Za-z][A-Za-z0-9-]{1,47}$/);
const slug = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/)
  .max(64);
const text = z.string().trim().min(1).max(2000);
const version = z
  .string()
  .regex(/^(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})\.(0|[1-9]\d{0,4})$/);
const ids = z
  .array(id)
  .max(50)
  .superRefine((values, context) => {
    if (new Set(values).size !== values.length)
      context.addIssue({ code: 'custom', message: 'Duplicate ID' });
  });
const position = z.number().int().positive().max(1000);

export const conceptsSchema = z
  .object({
    concepts: z
      .array(z.object({ id, title: text }).strict())
      .min(1)
      .max(200),
  })
  .strict();
export const journeySchema = z
  .object({
    id,
    slug,
    title: text,
    position,
    status: z.enum(['draft', 'reviewed']),
    entryRequirements: z.array(text).max(20),
    outcomes: z
      .array(
        z
          .object({
            id: z.enum(['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8']),
            description: text,
          })
          .strict(),
      )
      .min(1)
      .max(8),
    chapterIds: ids,
  })
  .strict();
export const chapterSchema = z
  .object({
    id,
    journeyId: id,
    slug,
    title: text,
    position,
    objectiveSummary: text,
    questIds: ids,
  })
  .strict();
export const transitionSchema = z
  .object({
    from: version,
    to: version,
    fromAssessment: version,
    toAssessment: version,
    compatibility: z.enum(['compatible', 'incompatible']),
    pendingWork: z.enum(['accept-new', 'retry-current']),
    reason: text,
    retryGuidance: text.optional(),
    curriculumReview: z.enum(['pending', 'approved']),
    technicalReview: z.enum(['pending', 'approved']),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.compatibility === 'incompatible' && !value.retryGuidance)
      context.addIssue({
        code: 'custom',
        path: ['retryGuidance'],
        message: 'Incompatible transition requires retry guidance',
      });
  });
export const questSchema = z
  .object({
    id,
    chapterId: id,
    slug,
    position,
    kind: z.enum(['instructional', 'capstone']),
    guestEligible: z.boolean(),
    currentVersion: version,
    transitions: z.array(transitionSchema).max(50),
  })
  .strict();
export const versionSchema = z
  .object({
    contentVersion: version,
    assessmentVersion: version,
    title: text,
    objective: text,
    outcomeId: z.enum(['O1', 'O2', 'O3', 'O4', 'O5', 'O6', 'O7', 'O8']),
    conceptIds: ids,
    prerequisiteQuestIds: ids,
    difficulty: z.enum(['introductory', 'developing', 'integrative']),
    xpAward: z.number().int().positive().max(1000),
    hints: z.object({ question: text, concept: text, nextStep: text }).strict(),
    caseIds: ids,
    explanationPrompt: text.optional(),
    transferPrompt: text.optional(),
  })
  .strict();

const caseBase = z.object({
  id,
  category: z.enum(['normal', 'boundary']),
  feedback: text,
});
const jsonValue: z.ZodType<unknown> = z.json();
export const caseSchema = z.discriminatedUnion('kind', [
  caseBase
    .extend({
      kind: z.literal('console'),
      expectedOutput: z.string().max(2000),
    })
    .strict(),
  caseBase
    .extend({
      kind: z.literal('function'),
      functionName: id,
      args: z.array(jsonValue).max(10),
      expected: jsonValue,
    })
    .strict(),
]);
export const casesSchema = z
  .array(caseSchema)
  .min(2)
  .max(30)
  .superRefine((cases, context) => {
    if (new Set(cases.map((item) => item.id)).size !== cases.length)
      context.addIssue({ code: 'custom', message: 'Duplicate case ID' });
    for (const category of ['normal', 'boundary']) {
      if (!cases.some((item) => item.category === category))
        context.addIssue({
          code: 'custom',
          message: `Missing ${category} case`,
        });
    }
  });

const publicationQuestSchema = z
  .object({
    id,
    contentVersion: version,
    assessmentVersion: version,
  })
  .strict();

export const publicationSchema = z
  .object({
    schemaVersion: z.literal(1),
    journeys: z
      .array(
        z
          .object({
            id,
            curriculumReview: z.literal('approved'),
            technicalReview: z.literal('approved'),
            quests: z.array(publicationQuestSchema).max(500),
          })
          .strict(),
      )
      .max(50),
  })
  .strict()
  .superRefine((value, context) => {
    if (
      new Set(value.journeys.map((item) => item.id)).size !==
      value.journeys.length
    )
      context.addIssue({ code: 'custom', message: 'Duplicate journey ID' });
    for (const [index, journey] of value.journeys.entries()) {
      if (
        new Set(journey.quests.map((item) => item.id)).size !==
        journey.quests.length
      )
        context.addIssue({
          code: 'custom',
          path: ['journeys', index, 'quests'],
          message: 'Duplicate quest ID',
        });
    }
  });

export type Quest = z.infer<typeof questSchema>;
export type QuestVersion = z.infer<typeof versionSchema>;
export type Journey = z.infer<typeof journeySchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type CurriculumCase = z.infer<typeof caseSchema>;
export type Publication = z.infer<typeof publicationSchema>;
