import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  loadAuthoredCurriculum,
  loadCurriculumCatalog,
} from './curriculum-catalog';
import { publicationSchema } from './content-schema';

const source = resolve(process.cwd(), 'content');
const created: string[] = [];

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'codequest-publication-'));
  created.push(root);
  cpSync(source, root, { recursive: true });
  return root;
}

function reviewed(root: string): void {
  const file = join(root, 'journeys/javascript-foundations/journey.yaml');
  writeFileSync(
    file,
    readFileSync(file, 'utf8').replace('status: draft', 'status: reviewed'),
  );
}

function publish(root: string, overrides = ''): void {
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
${overrides}`,
  );
}

afterEach(() => {
  for (const root of created.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('curriculum publication catalog', () => {
  it('rejects unknown publication fields and duplicate stable IDs', () => {
    const reviewedSelection = {
      schemaVersion: 1,
      journeys: [
        {
          id: 'JAVASCRIPT-FOUNDATIONS',
          curriculumReview: 'approved',
          technicalReview: 'approved',
          quests: [
            {
              id: 'Q01',
              contentVersion: '1.0.0',
              assessmentVersion: '1.0.0',
            },
          ],
        },
      ],
    };
    expect(publicationSchema.safeParse(reviewedSelection).success).toBe(true);
    expect(
      publicationSchema.safeParse({ ...reviewedSelection, unknown: true })
        .success,
    ).toBe(false);
    expect(
      publicationSchema.safeParse({
        ...reviewedSelection,
        journeys: [
          reviewedSelection.journeys[0],
          reviewedSelection.journeys[0],
        ],
      }).success,
    ).toBe(false);
  });

  it('accepts an empty production publication and freezes authored data', () => {
    const authored = loadAuthoredCurriculum(source);
    const catalog = loadCurriculumCatalog(source);

    expect(catalog.journeys).toEqual([]);
    expect(Object.isFrozen(authored)).toBe(true);
    expect(Object.isFrozen(authored.journeys[0].chapters[0].quests[0])).toBe(
      true,
    );
    expect(() => {
      (authored.journeys as unknown[]).push({});
    }).toThrow();
  });

  it('selects one exact reviewed snapshot with immutable learner content', () => {
    const root = fixture();
    reviewed(root);
    publish(root);
    const snapshot = join(
      root,
      'journeys/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
    );
    mkdirSync(join(snapshot, 'assets'), { recursive: true });
    writeFileSync(join(snapshot, 'assets/scope.png'), Buffer.from('png-data'));
    writeFileSync(
      join(snapshot, 'lesson.mdx'),
      `${readFileSync(join(snapshot, 'lesson.mdx'), 'utf8')}\n\n![Scope](./assets/scope.png)\n`,
    );

    const catalog = loadCurriculumCatalog(root);
    const journey = catalog.journeys[0];
    const quest = journey.chapters[0].quests[0];
    expect(journey.metadata.id).toBe('JAVASCRIPT-FOUNDATIONS');
    expect(quest.activeSnapshot.metadata).toMatchObject({
      contentVersion: '1.0.0',
      assessmentVersion: '1.0.0',
    });
    expect(quest.activeSnapshot.lesson).toContain('# First message');
    expect(quest.activeSnapshot.cases).toHaveLength(2);
    expect(quest.activeSnapshot.assets['assets/scope.png']).toEqual({
      mediaType: 'image/png',
      bytesBase64: Buffer.from('png-data').toString('base64'),
    });
    expect(Object.isFrozen(quest.activeSnapshot)).toBe(true);
  });

  it('rejects an oversized selected-snapshot asset', () => {
    const root = fixture();
    reviewed(root);
    publish(root);
    const snapshot = join(
      root,
      'journeys/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
    );
    mkdirSync(join(snapshot, 'assets'), { recursive: true });
    writeFileSync(
      join(snapshot, 'assets/oversized.webp'),
      Buffer.alloc(262_145),
    );
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Invalid or oversized content file',
    );
  });

  it('rejects a symbolic lesson asset directory', () => {
    const root = fixture();
    reviewed(root);
    publish(root);
    const outside = mkdtempSync(join(tmpdir(), 'codequest-asset-outside-'));
    created.push(outside);
    writeFileSync(join(outside, 'outside.png'), Buffer.from('outside'));
    const snapshot = join(
      root,
      'journeys/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
    );
    symlinkSync(outside, join(snapshot, 'assets'), 'junction');
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Symbolic links are not permitted',
    );
  });

  it.each([
    ['draft journey', undefined, 'Selected journey is not reviewed'],
    [
      'stale version',
      'contentVersion: 9.9.9',
      'Selected quest version is stale',
    ],
    ['unapproved review', 'technicalReview: pending', 'Invalid publication'],
  ])('rejects a %s safely', (_name, replacement, message) => {
    const root = fixture();
    reviewed(root);
    publish(root);
    if (_name === 'draft journey') {
      const file = join(root, 'journeys/javascript-foundations/journey.yaml');
      writeFileSync(
        file,
        readFileSync(file, 'utf8').replace('status: reviewed', 'status: draft'),
      );
    } else if (replacement) {
      const file = join(root, 'publication.yaml');
      const current = readFileSync(file, 'utf8');
      const target = replacement.startsWith('contentVersion')
        ? 'contentVersion: 1.0.0'
        : 'technicalReview: approved';
      writeFileSync(file, current.replace(target, replacement));
    }
    expect(() => loadCurriculumCatalog(root)).toThrow(message);
  });

  it('rejects incomplete and duplicate selections without echoing values', () => {
    const root = fixture();
    reviewed(root);
    writeFileSync(
      join(root, 'publication.yaml'),
      'schemaVersion: 1\njourneys:\n  - id: credential-private-value\n    curriculumReview: approved\n    technicalReview: approved\n    quests: []\n',
    );
    try {
      loadCurriculumCatalog(root);
      throw new Error('Expected publication validation to fail');
    } catch (error) {
      expect(String(error)).toContain('publication.yaml');
      expect(String(error)).not.toContain('credential-private-value');
    }

    publish(root);
    const file = join(root, 'publication.yaml');
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace(
        'assessmentVersion: 1.0.0',
        'assessmentVersion: 1.0.0\n      - id: Q01\n        contentVersion: 1.0.0\n        assessmentVersion: 1.0.0',
      ),
    );
    expect(() => loadCurriculumCatalog(root)).toThrow('Invalid publication');
  });

  it('rejects incomplete journey inventory and globally ambiguous slugs', () => {
    const root = fixture();
    reviewed(root);
    writeFileSync(
      join(root, 'publication.yaml'),
      `schemaVersion: 1
journeys:
  - id: JAVASCRIPT-FOUNDATIONS
    curriculumReview: approved
    technicalReview: approved
    quests: []
`,
    );
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Published journey inventory is incomplete',
    );

    const oldQuest = join(
      root,
      'journeys/javascript-foundations/chapters/variables/quests/first-message',
    );
    const collidingQuest = join(
      root,
      'journeys/javascript-foundations/chapters/variables/quests/variables',
    );
    renameSync(oldQuest, collidingQuest);
    const questFile = join(collidingQuest, 'quest.yaml');
    writeFileSync(
      questFile,
      readFileSync(questFile, 'utf8').replace(
        'slug: first-message',
        'slug: variables',
      ),
    );
    publish(root);
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Published slug is ambiguous',
    );
  });

  it('rejects a published snapshot with a dangling prerequisite', () => {
    const root = fixture();
    reviewed(root);
    publish(root);
    const versionFile = join(
      root,
      'journeys/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0/version.yaml',
    );
    writeFileSync(
      versionFile,
      readFileSync(versionFile, 'utf8').replace(
        'prerequisiteQuestIds: []',
        'prerequisiteQuestIds:\n  - Q99',
      ),
    );
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Unknown or self prerequisite quest ID',
    );
  });
});
