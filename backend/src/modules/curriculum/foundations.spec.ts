import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApplication } from '../../application';
import { loadBackendConfig } from '../../infrastructure/config/backend-config';
import { normalizeAttemptReport } from '../learning/attempt-report';
import { completionIsCurrent } from './content/completion-compatibility';
import {
  loadAuthoredCurriculum,
  loadCurriculumCatalog,
} from './content/curriculum-catalog';
import { CurriculumService } from './curriculum.service';

const root = resolve('content');
const questPath =
  'journeys/javascript-foundations/chapters/variables/quests/first-message';
const ids = Array.from(
  { length: 24 },
  (_, i) => `Q${String(i + 1).padStart(2, '0')}`,
);

describe('reviewed JavaScript Foundations course', () => {
  it('publishes exactly the approved ordered instructional inventory and guest subset', () => {
    const catalog = loadCurriculumCatalog(root);
    expect(catalog.journeys).toHaveLength(1);
    const journey = catalog.journeys[0];
    expect(journey.chapters.map((chapter) => chapter.metadata.title)).toEqual([
      'Variables',
      'Operators',
      'Conditionals',
      'Loops',
      'Functions',
      'Arrays & Objects',
      'Integration',
    ]);
    expect(journey.chapters.map((chapter) => chapter.quests.length)).toEqual([
      4, 3, 3, 4, 4, 4, 3,
    ]);
    const quests = journey.chapters.flatMap((chapter) => chapter.quests);
    expect(quests.map((quest) => quest.metadata.id)).toEqual([...ids, 'CAP01']);
    expect(
      quests
        .filter((quest) => quest.metadata.guestEligible)
        .map((quest) => quest.metadata.id),
    ).toEqual(ids.slice(0, 4));
    for (const [index, quest] of quests.entries()) {
      if (quest.metadata.id === 'CAP01') {
        expect(quest.metadata.kind).toBe('capstone');
        expect(quest.metadata.guestEligible).toBe(false);
        expect(quest.activeSnapshot.metadata.prerequisiteQuestIds).toEqual([
          'Q24',
        ]);
        expect(quest.activeSnapshot.metadata.explanationPrompt).toBeTruthy();
        expect(quest.activeSnapshot.metadata.transferPrompt).toBeTruthy();
        continue;
      }
      expect(quest.metadata.kind).toBe('instructional');
      expect(quest.activeSnapshot.metadata.prerequisiteQuestIds).toEqual(
        index === 0 ? [] : [ids[index - 1]],
      );
      expect(quest.activeSnapshot.metadata.xpAward).toBe(10);
      expect(quest.activeSnapshot.lesson).toContain('## Reflect (ungraded)');
      expect(quest.activeSnapshot.lesson).toContain('## Check contract');
      expect(quest.activeSnapshot.metadata.explanationPrompt).toBeUndefined();
    }
  });

  it('preserves the original Q01 bytes and accepts its explicit editorial compatibility', () => {
    for (const file of [
      'version.yaml',
      'lesson.mdx',
      'starter.js',
      'tests.ts',
    ]) {
      expect(
        readFileSync(join(root, questPath, 'versions/1.0.0', file)),
      ).toEqual(
        readFileSync(
          join(
            'test/fixtures/curriculum-draft',
            questPath,
            'versions/1.0.0',
            file,
          ),
        ),
      );
    }
    const authored =
      loadAuthoredCurriculum(root).journeys[0].chapters[0].quests[0];
    const quest = loadCurriculumCatalog(root).journeys[0].chapters[0].quests[0];
    expect(quest.activeSnapshot.metadata.contentVersion).toBe('1.1.0');
    expect(quest.activeSnapshot.metadata.assessmentVersion).toBe('1.0.0');
    expect(quest.activeSnapshot.cases).toEqual(
      authored.snapshots['1.0.0'].cases,
    );
    expect(completionIsCurrent(quest, '1.0.0', '1.0.0')).toBe(true);
    expect(quest.activeSnapshot.lesson).not.toContain(
      'draft authoring example',
    );
  });

  it('fits the existing local runtime and backend report bounds without running source', () => {
    const catalog = loadCurriculumCatalog(root);
    const service = new CurriculumService(catalog);
    for (const chapter of catalog.journeys[0].chapters) {
      for (const quest of chapter.quests) {
        const dto = service.findQuest(quest.metadata.slug);
        expect(dto.cases.length).toBeGreaterThanOrEqual(2);
        expect(dto.cases.length).toBeLessThanOrEqual(10);
        expect(dto.cases.map((item) => item.category)).toContain('normal');
        expect(dto.cases.map((item) => item.category)).toContain('boundary');
        expect(Buffer.byteLength(JSON.stringify(dto.cases))).toBeLessThan(
          16_384,
        );
        expect(Buffer.byteLength(dto.starterCode)).toBeLessThan(32_768);
        for (const item of dto.cases)
          expect(Buffer.byteLength(item.feedback)).toBeLessThanOrEqual(512);
        expect(
          normalizeAttemptReport(
            {
              checkId: '00000000-0000-4000-8000-000000000029',
              status: 'completed',
              passed: true,
              cases: dto.cases.map((item) => ({
                id: item.id,
                label: item.id,
                status: 'passed',
                message: 'Passed',
              })),
              failedCaseIds: [],
              feedback: 'Passed',
              durationMs: 100,
            },
            quest.activeSnapshot.cases,
          ).passed,
        ).toBe(true);
      }
    }
  });

  it('serves the real selected course through public NestJS routes without internal history', async () => {
    const config = loadBackendConfig({
      NODE_ENV: 'test',
      DATABASE_URL:
        'postgresql://codequest:local-fixture@127.0.0.1:5432/codequest_test',
      SUPABASE_AUTH_ISSUER: 'http://127.0.0.1:54321/auth/v1',
      SUPABASE_AUTH_AUDIENCE: 'authenticated',
      SUPABASE_AUTH_JWKS_URL:
        'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
      RATE_LIMIT_MAX: '1000',
    });
    const app = await createApplication(config, {
      nestLogger: false,
      enableShutdownHooks: false,
      foundationLogger: { requestCompleted: vi.fn(), unexpectedError: vi.fn() },
    });
    try {
      const http: FastifyInstance = app.getHttpAdapter().getInstance();
      const list = await http.inject({
        method: 'GET',
        url: '/api/v1/journeys',
      });
      expect(list.json()).toEqual([
        expect.objectContaining({ questCount: 25, chapterCount: 7 }),
      ]);
      const catalog = loadCurriculumCatalog(root);
      for (const chapter of catalog.journeys[0].chapters) {
        const chapterResponse = await http.inject({
          method: 'GET',
          url: `/api/v1/chapters/${chapter.metadata.slug}`,
        });
        expect(chapterResponse.statusCode).toBe(200);
        for (const quest of chapter.quests) {
          const response = await http.inject({
            method: 'GET',
            url: `/api/v1/quests/${quest.metadata.slug}`,
          });
          expect(response.statusCode).toBe(200);
          expect(response.json().id).toBe(quest.metadata.id);
          for (const field of [
            'snapshots',
            'transitions',
            'reference',
            'alternative',
            'defective',
            'curriculumReview',
            'technicalReview',
          ])
            expect(response.json()).not.toHaveProperty(field);
          expect(response.body).not.toContain('backend/content');
        }
      }
    } finally {
      await app.close();
    }
  }, 30_000);
});
