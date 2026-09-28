import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { completionIsCurrent } from './completion-compatibility';
import { loadCurriculumCatalog } from './curriculum-catalog';

const root = mkdtempSync(join(tmpdir(), 'codequest-unlock-policy-'));
cpSync(resolve('content'), root, { recursive: true });
const journey = join(root, 'journeys/javascript-foundations/journey.yaml');
writeFileSync(
  journey,
  readFileSync(journey, 'utf8').replace('status: draft', 'status: reviewed'),
);
writeFileSync(
  join(root, 'publication.yaml'),
  `schemaVersion: 1
journeys:
  - id: JAVASCRIPT-FOUNDATIONS
    curriculumReview: approved
    technicalReview: approved
    quests:
      - id: Q01
        contentVersion: 1.0.0
        assessmentVersion: 1.0.0
`,
);
const original = loadCurriculumCatalog(root).journeys[0].chapters[0].quests[0];
afterAll(() => rmSync(root, { recursive: true, force: true }));

describe('accepted completion compatibility', () => {
  it('accepts active and explicitly approved compatible transitions', () => {
    expect(completionIsCurrent(original, '1.0.0', '1.0.0')).toBe(true);
    const updated = {
      ...original,
      metadata: {
        ...original.metadata,
        transitions: [
          {
            from: '1.0.0',
            to: '2.0.0',
            fromAssessment: '1.0.0',
            toAssessment: '2.0.0',
            compatibility: 'compatible' as const,
            pendingWork: 'accept-new' as const,
            reason: 'Equivalent assessment',
            curriculumReview: 'approved' as const,
            technicalReview: 'approved' as const,
          },
        ],
      },
      activeSnapshot: {
        ...original.activeSnapshot,
        metadata: {
          ...original.activeSnapshot.metadata,
          contentVersion: '2.0.0',
          assessmentVersion: '2.0.0',
        },
      },
    };
    expect(completionIsCurrent(updated, '1.0.0', '1.0.0')).toBe(true);
    expect(
      completionIsCurrent(
        { ...updated, metadata: { ...updated.metadata, transitions: [] } },
        '1.0.0',
        '1.0.0',
      ),
    ).toBe(false);
    expect(
      completionIsCurrent(
        {
          ...updated,
          metadata: {
            ...updated.metadata,
            transitions: [
              {
                ...updated.metadata.transitions[0],
                compatibility: 'incompatible',
              },
            ],
          },
        },
        '1.0.0',
        '1.0.0',
      ),
    ).toBe(false);
    expect(
      completionIsCurrent(
        {
          ...updated,
          metadata: {
            ...updated.metadata,
            transitions: [
              {
                ...updated.metadata.transitions[0],
                technicalReview: 'pending',
              },
            ],
          },
        },
        '1.0.0',
        '1.0.0',
      ),
    ).toBe(false);
    expect(
      completionIsCurrent(
        {
          ...updated,
          metadata: {
            ...updated.metadata,
            transitions: [
              {
                ...updated.metadata.transitions[0],
                to: '1.0.0',
                toAssessment: '1.0.0',
              },
            ],
          },
        },
        '1.0.0',
        '1.0.0',
      ),
    ).toBe(false);
  });
});
