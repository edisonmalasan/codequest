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
import { exerciseSchema, publicationSchema } from './content-schema';

const source = resolve(process.cwd(), 'test/fixtures/curriculum-draft');
const created: string[] = [];

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'codequest-publication-'));
  created.push(root);
  cpSync(source, root, { recursive: true });
  return root;
}

function reviewed(root: string): void {
  for (const file of [
    join(root, 'journeys/javascript-foundations/journey.yaml'),
    join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/course.yaml',
    ),
  ])
    writeFileSync(
      file,
      readFileSync(file, 'utf8').replace('status: draft', 'status: reviewed'),
    );
}

function publish(root: string, overrides = ''): void {
  writeFileSync(
    join(root, 'publication.yaml'),
    `schemaVersion: 2
journeys:
  - id: JAVASCRIPT-FOUNDATIONS
    curriculumReview: approved
    technicalReview: approved
    courses:
      - id: COURSE-JS-FOUNDATIONS
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
  it('publishes complete reviewed HTML and CSS Courses alongside the unchanged JavaScript inventory', () => {
    const catalog = loadCurriculumCatalog(resolve(process.cwd(), 'content'));
    expect(catalog.journeys.map((journey) => journey.metadata.id)).toEqual([
      'JAVASCRIPT-FOUNDATIONS',
      'WEB-FOUNDATIONS',
    ]);
    const [javascript, web] = catalog.journeys;
    expect(
      javascript.chapters.flatMap((chapter) =>
        chapter.quests.map((quest) => quest.metadata.id),
      ),
    ).toEqual([
      ...Array.from(
        { length: 24 },
        (_, index) => `Q${String(index + 1).padStart(2, '0')}`,
      ),
      'CAP01',
    ]);
    expect(web.courses.map((course) => course.metadata.id)).toEqual([
      'COURSE-HTML-FOUNDATIONS',
      'COURSE-CSS-FOUNDATIONS',
    ]);
    expect(web.chapters.map((chapter) => chapter.metadata.id)).toEqual([
      'HTML-CH01',
      'HTML-CH02',
      'HTML-CH03',
      'HTML-CH04',
      'CSS-CH01',
      'CSS-CH02',
      'CSS-CH03',
      'CSS-CH04',
    ]);
    expect(
      web.chapters.flatMap((chapter) =>
        chapter.quests.map((quest) => quest.metadata.id),
      ),
    ).toEqual([
      ...Array.from(
        { length: 12 },
        (_, index) => `HTML${String(index + 1).padStart(2, '0')}`,
      ),
      ...Array.from(
        { length: 12 },
        (_, index) => `CSS${String(index + 1).padStart(2, '0')}`,
      ),
    ]);
    expect(
      web.chapters.every((chapter) =>
        chapter.quests.every(
          (quest) => quest.activeSnapshot.exercise?.mode === 'static-web',
        ),
      ),
    ).toBe(true);
  });
  it('keeps a partial or unreviewed HTML Course out of publication', () => {
    const root = mkdtempSync(join(tmpdir(), 'codequest-html-publication-'));
    created.push(root);
    cpSync(resolve(process.cwd(), 'content'), root, { recursive: true });
    const publicationPath = join(root, 'publication.yaml');
    const published = readFileSync(publicationPath, 'utf8');
    const finalQuest = [
      '          - id: HTML12',
      '            contentVersion: 1.0.0',
      '            assessmentVersion: 1.0.0',
      '            curriculumReview: approved',
      '            technicalReview: approved',
    ].join('\n');
    expect(published).toContain(finalQuest);
    writeFileSync(publicationPath, published.replace(finalQuest, ''));
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Published Course inventory is incomplete',
    );
    writeFileSync(
      publicationPath,
      published.replace(
        finalQuest,
        finalQuest.replace('            technicalReview: approved', ''),
      ),
    );
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Web exercise review is missing',
    );
  });
  it('keeps a partial or unreviewed CSS Course out of publication', () => {
    const root = mkdtempSync(join(tmpdir(), 'codequest-css-publication-'));
    created.push(root);
    cpSync(resolve(process.cwd(), 'content'), root, { recursive: true });
    const publicationPath = join(root, 'publication.yaml');
    const published = readFileSync(publicationPath, 'utf8');
    const finalQuest = [
      '          - id: CSS12',
      '            contentVersion: 1.0.0',
      '            assessmentVersion: 1.0.0',
      '            curriculumReview: approved',
      '            technicalReview: approved',
    ].join('\n');
    expect(published).toContain(finalQuest);
    writeFileSync(publicationPath, published.replace(finalQuest, ''));
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Published Course inventory is incomplete',
    );
    writeFileSync(
      publicationPath,
      published.replace(
        finalQuest,
        finalQuest.replace('            technicalReview: approved', ''),
      ),
    );
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Web exercise review is missing',
    );
    writeFileSync(publicationPath, published);
    const coursePath = join(
      root,
      'journeys/web-foundations/courses/css-foundations/course.yaml',
    );
    writeFileSync(
      coursePath,
      readFileSync(coursePath, 'utf8').replace(
        'status: reviewed',
        'status: draft',
      ),
    );
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Selected Course is missing or unreviewed',
    );
  });
  it('rejects unsafe or incompatible exercise descriptors before publication', () => {
    const base = {
      schemaVersion: 1,
      mode: 'static-web',
      files: [
        {
          id: 'page',
          name: 'index.html',
          language: 'html',
          starterFile: 'starter.html',
        },
        {
          id: 'style',
          name: 'style.css',
          language: 'css',
          starterFile: 'starter.css',
        },
      ],
    };
    expect(exerciseSchema.safeParse(base).success).toBe(true);
    expect(
      exerciseSchema.safeParse({
        ...base,
        files: [base.files[0], base.files[0]],
      }).success,
    ).toBe(false);
    expect(
      exerciseSchema.safeParse({ ...base, mode: 'interactive-web' }).success,
    ).toBe(false);
    expect(
      exerciseSchema.safeParse({
        ...base,
        files: [{ ...base.files[0], name: '../index.html' }],
      }).success,
    ).toBe(false);
    expect(
      exerciseSchema.safeParse({
        ...base,
        files: [
          ...base.files,
          {
            id: 'logic',
            name: 'main.js',
            language: 'javascript',
            starterFile: 'starter.js',
          },
        ],
      }).success,
    ).toBe(false);
  });

  it('loads only a reviewed bounded synthetic web snapshot', () => {
    const root = fixture();
    reviewed(root);
    const snapshot = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
    );
    writeFileSync(
      join(snapshot, 'version.yaml'),
      `${readFileSync(join(snapshot, 'version.yaml'), 'utf8')}exercise:\n  schemaVersion: 1\n  mode: static-web\n  files:\n    - id: page\n      name: index.html\n      language: html\n      starterFile: starter.html\n    - id: style\n      name: style.css\n      language: css\n      starterFile: starter.css\n`,
    );
    writeFileSync(
      join(snapshot, 'starter.html'),
      '<h1 id="heading">Hello</h1>',
    );
    writeFileSync(join(snapshot, 'starter.css'), 'h1 { color: blue; }');
    writeFileSync(
      join(snapshot, 'tests.ts'),
      `export const cases = [\n  { id: 'normal-message', category: 'normal', kind: 'html-element', selector: '#heading', expectedText: 'Hello', feedback: 'Add the heading.' },\n  { id: 'boundary-exact-output', category: 'boundary', kind: 'css-declaration', selector: 'h1', property: 'color', expectedValue: 'blue', media: { type: 'max-width', widthPx: 600 }, feedback: 'Use blue.' },\n];\n`,
    );
    publish(
      root,
      '            curriculumReview: approved\n            technicalReview: approved\n',
    );
    const selected =
      loadCurriculumCatalog(root).journeys[0].chapters[0].quests[0]
        .activeSnapshot;
    expect(selected.exercise?.mode).toBe('static-web');
    expect(selected.exercise?.files.map((file) => file.starterSource)).toEqual([
      '<h1 id="heading">Hello</h1>',
      'h1 { color: blue; }',
    ]);
    expect(selected.starterCode).toBe('');
    expect(selected.cases[1]).toMatchObject({
      kind: 'css-declaration',
      media: { type: 'max-width', widthPx: 600 },
    });
    publish(root);
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Web exercise review is missing',
    );
    writeFileSync(join(snapshot, 'starter.css'), 'x'.repeat(32_769));
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'File exceeds size limit',
    );
  });
  it('gates each interactive snapshot on approved review and version-bound evidence', () => {
    const root = fixture();
    const evidenceRoot = mkdtempSync(join(tmpdir(), 'codequest-evidence-'));
    created.push(evidenceRoot);
    reviewed(root);
    const snapshot = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
    );
    writeFileSync(
      join(snapshot, 'version.yaml'),
      `${readFileSync(join(snapshot, 'version.yaml'), 'utf8')}exercise:\n  schemaVersion: 1\n  mode: interactive-web\n  files:\n    - id: page\n      name: index.html\n      language: html\n      starterFile: starter.html\n    - id: logic\n      name: main.js\n      language: javascript\n      starterFile: starter.js\n`,
    );
    writeFileSync(
      join(snapshot, 'starter.html'),
      '<button id="trigger">Go</button><p id="answer">Ready</p>',
    );
    writeFileSync(
      join(snapshot, 'starter.js'),
      'document.getElementById("trigger").addEventListener("click", () => { document.getElementById("answer").textContent = "Done"; });',
    );
    writeFileSync(
      join(snapshot, 'tests.ts'),
      `export const cases = [
  { id: 'normal-message', category: 'normal', kind: 'interactive-text', selector: '#answer', events: [{ type: 'click', targetId: 'trigger' }], expectedText: 'Done', feedback: 'Handle the click.' },
  { id: 'boundary-exact-output', category: 'boundary', kind: 'interactive-text', selector: '#answer', events: [], expectedText: 'Ready', feedback: 'Keep the initial text.' },
];\n`,
    );
    const reviews =
      '            curriculumReview: approved\n            technicalReview: approved\n';
    publish(root, reviews);
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Interactive publication evidence is missing',
    );
    publish(
      root,
      `${reviews}            interactiveEvidence:\n              build: abcdef1\n              date: 2026-10-05\n              record: docs/interactive-review.md\n              contentVersion: 0.9.0\n              assessmentVersion: 1.0.0\n`,
    );
    expect(() => loadCurriculumCatalog(root, evidenceRoot)).toThrow(
      'Interactive publication evidence does not match',
    );
    const publication = join(root, 'publication.yaml');
    writeFileSync(
      publication,
      readFileSync(publication, 'utf8').replace(
        'contentVersion: 0.9.0',
        'contentVersion: 1.0.0',
      ),
    );
    expect(() => loadCurriculumCatalog(root, evidenceRoot)).toThrow(
      'Interactive publication evidence record is unavailable',
    );
    mkdirSync(join(evidenceRoot, 'docs'));
    writeFileSync(
      join(evidenceRoot, 'docs/interactive-review.md'),
      'Synthetic reviewed build abcdef1\n',
    );
    expect(
      loadCurriculumCatalog(root, evidenceRoot).journeys[0].chapters[0]
        .quests[0].metadata.id,
    ).toBe('Q01');
    publish(
      root,
      `            curriculumReview: approved\n            technicalReview: approved\n            interactiveEvidence:\n              build: abcdef1\n              date: 2026-10-05\n              record: docs/interactive-review.md\n              contentVersion: 1.0.0\n              assessmentVersion: 1.0.1\n`,
    );
    expect(() => loadCurriculumCatalog(root, evidenceRoot)).toThrow(
      'Interactive publication evidence does not match',
    );
    const firstQuest = resolve(snapshot, '../..');
    const chapter = resolve(firstQuest, '../..');
    const secondQuest = join(chapter, 'quests/second-interaction');
    cpSync(firstQuest, secondQuest, { recursive: true });
    const secondMetadata = join(secondQuest, 'quest.yaml');
    writeFileSync(
      secondMetadata,
      readFileSync(secondMetadata, 'utf8')
        .replace('id: Q01', 'id: Q02')
        .replace('slug: first-message', 'slug: second-interaction')
        .replace('position: 1', 'position: 2'),
    );
    const secondVersion = join(secondQuest, 'versions/1.0.0/version.yaml');
    writeFileSync(
      secondVersion,
      readFileSync(secondVersion, 'utf8').replace(
        'prerequisiteQuestIds: []',
        'prerequisiteQuestIds: [Q01]',
      ),
    );
    const chapterMetadata = join(chapter, 'chapter.yaml');
    writeFileSync(
      chapterMetadata,
      readFileSync(chapterMetadata, 'utf8').replace(
        '  - Q01',
        '  - Q01\n  - Q02',
      ),
    );
    publish(
      root,
      `${reviews}            interactiveEvidence:\n              build: abcdef1\n              date: 2026-10-05\n              record: docs/interactive-review.md\n              contentVersion: 1.0.0\n              assessmentVersion: 1.0.0\n          - id: Q02\n            contentVersion: 1.0.0\n            assessmentVersion: 1.0.0\n`,
    );
    expect(() => loadCurriculumCatalog(root, evidenceRoot)).toThrow(
      'Web exercise review is missing',
    );
  });
  it('rejects unknown publication fields and duplicate stable IDs', () => {
    const reviewedSelection = {
      schemaVersion: 2,
      journeys: [
        {
          id: 'JAVASCRIPT-FOUNDATIONS',
          curriculumReview: 'approved',
          technicalReview: 'approved',
          courses: [
            {
              id: 'COURSE-JS-FOUNDATIONS',
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

  it('accepts an empty representative publication and freezes authored data', () => {
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
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
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

  it('keeps an authored draft Course out of the published catalog', () => {
    const root = fixture();
    reviewed(root);
    const journeyFile = join(
      root,
      'journeys/javascript-foundations/journey.yaml',
    );
    writeFileSync(
      journeyFile,
      `${readFileSync(journeyFile, 'utf8')}  - COURSE-FUTURE\n`,
    );
    const draftPath = join(
      root,
      'journeys/javascript-foundations/courses/future-course',
    );
    mkdirSync(draftPath, { recursive: true });
    mkdirSync(join(draftPath, 'chapters'));
    writeFileSync(
      join(draftPath, 'course.yaml'),
      `id: COURSE-FUTURE
journeyId: JAVASCRIPT-FOUNDATIONS
slug: future-course
title: Future Course
summary: An unpublished course draft.
position: 2
status: draft
topics:
  - javascript
outcomes:
  - id: C2
    description: Explore a later topic.
chapterIds: []
`,
    );
    publish(root);

    const catalog = loadCurriculumCatalog(root);
    expect(
      catalog.journeys[0].courses.map((course) => course.metadata.id),
    ).toEqual(['COURSE-JS-FOUNDATIONS']);
    expect(catalog.journeys[0].chapters).toHaveLength(1);
  });

  it('rejects an oversized selected-snapshot asset', () => {
    const root = fixture();
    reviewed(root);
    publish(root);
    const snapshot = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
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
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
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
      'schemaVersion: 2\njourneys:\n  - id: credential-private-value\n    curriculumReview: approved\n    technicalReview: approved\n    courses: []\n',
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
        'assessmentVersion: 1.0.0\n          - id: Q01\n            contentVersion: 1.0.0\n            assessmentVersion: 1.0.0',
      ),
    );
    expect(() => loadCurriculumCatalog(root)).toThrow('Invalid publication');
  });

  it('rejects incomplete journey inventory and globally ambiguous slugs', () => {
    const root = fixture();
    reviewed(root);
    writeFileSync(
      join(root, 'publication.yaml'),
      `schemaVersion: 2
journeys:
  - id: JAVASCRIPT-FOUNDATIONS
    curriculumReview: approved
    technicalReview: approved
    courses:
      - id: COURSE-JS-FOUNDATIONS
        curriculumReview: approved
        technicalReview: approved
        quests: []
`,
    );
    expect(() => loadCurriculumCatalog(root)).toThrow(
      'Published Course inventory is incomplete',
    );

    const oldQuest = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message',
    );
    const collidingQuest = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/variables',
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
      'Published quest slug is ambiguous',
    );
  });

  it('rejects a published snapshot with a dangling prerequisite', () => {
    const root = fixture();
    reviewed(root);
    publish(root);
    const versionFile = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0/version.yaml',
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
