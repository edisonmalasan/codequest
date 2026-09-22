import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  caseSchema,
  journeySchema,
  transitionSchema,
  versionSchema,
} from './content-schema';
import { validateCurriculum } from './validate-curriculum';
import { safeFile } from './static-files';

const source = resolve(process.cwd(), 'content');
const quest =
  'journeys/javascript-foundations/chapters/variables/quests/first-message';
const snapshot = `${quest}/versions/1.0.0`;
const created: string[] = [];
function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'codequest-content-'));
  created.push(root);
  cpSync(source, root, { recursive: true });
  return root;
}
function replace(
  root: string,
  file: string,
  before: string,
  after: string,
): void {
  const path = join(root, file);
  const original = readFileSync(path, 'utf8');
  expect(original).toContain(before);
  writeFileSync(path, original.replace(before, after));
}
afterEach(() => {
  for (const root of created.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('Git curriculum authoring validation', () => {
  it('accepts the single explicitly draft Foundations fixture', () =>
    expect(() => validateCurriculum(source)).not.toThrow());

  it('rejects missing, unknown, and out-of-range schema fields', () => {
    expect(journeySchema.safeParse({ id: 'J1' }).success).toBe(false);
    const root = fixture();
    replace(
      root,
      'journeys/javascript-foundations/journey.yaml',
      'status: draft',
      'status: draft\nunknown: true',
    );
    expect(() => validateCurriculum(root)).toThrow('journey.yaml');
    expect(versionSchema.safeParse({ xpAward: 1001 }).success).toBe(false);
  });

  it('rejects missing and oversized required files', () => {
    const root = fixture();
    rmSync(join(root, snapshot, 'lesson.mdx'));
    expect(() => validateCurriculum(root)).toThrow('Required file is missing');
    writeFileSync(join(root, snapshot, 'lesson.mdx'), 'x'.repeat(65_537));
    expect(() => validateCurriculum(root)).toThrow('File exceeds size limit');
  });

  it('rejects traversal, malformed YAML, and oversized assessment data', () => {
    const root = fixture();
    expect(() => safeFile(root, '../outside', 100)).toThrow(
      'Path escapes content root',
    );
    replace(root, 'concepts.yaml', 'concepts:', 'concepts: [\n');
    expect(() => validateCurriculum(root)).toThrow('Invalid YAML');
    writeFileSync(
      join(root, 'concepts.yaml'),
      readFileSync(join(source, 'concepts.yaml')),
    );
    writeFileSync(join(root, snapshot, 'tests.ts'), 'x'.repeat(32_769));
    expect(() => validateCurriculum(root)).toThrow('File exceeds size limit');
  });

  it('rejects unrecognized authored files', () => {
    const root = fixture();
    writeFileSync(
      join(root, snapshot, 'unsafe.ts'),
      'export const enabled = true;',
    );
    expect(() => validateCurriculum(root)).toThrow('Unexpected content file');
  });

  it.each([
    ['import Widget from "./widget"', 'Disallowed MDX node'],
    ['export const value = 1', 'Disallowed MDX node'],
    ['{console.log("unsafe")}', 'Disallowed MDX node'],
    ['<Widget />', 'Disallowed MDX node'],
    ['<iframe src="https://example.com" />', 'Disallowed MDX node'],
    ['![alt](https://example.com/a.png)', 'Image must use a local assets path'],
    ['![alt](./assets/active.svg)', 'Image must use a local assets path'],
    ['![alt](./assets/../secret.png)', 'Image must use a local assets path'],
    ['![](./assets/hero.png)', 'Image requires text alternative'],
    ['![alt](./assets/missing.png)', 'Required file is missing'],
  ])('rejects unsafe lesson material: %s', (lesson, message) => {
    const root = fixture();
    writeFileSync(join(root, snapshot, 'lesson.mdx'), lesson);
    expect(() => validateCurriculum(root)).toThrow(message);
  });

  it.each([
    'import "node:fs"; export const cases = []',
    'export const cases = [sideEffect()]',
    'export const cases = [() => true]',
    'export const cases = [{ id: "a", expected: undefined }]',
    'export const cases = []; console.log("run")',
    'export const cases: any = []',
  ])(
    'rejects executable assessment syntax without running it',
    (definition) => {
      const root = fixture();
      writeFileSync(join(root, snapshot, 'tests.ts'), definition);
      expect(() => validateCurriculum(root)).toThrow();
    },
  );

  it('rejects duplicate case IDs and a missing boundary case', () => {
    const root = fixture();
    replace(
      root,
      `${snapshot}/tests.ts`,
      "id: 'boundary-exact-output'",
      "id: 'normal-message'",
    );
    expect(() => validateCurriculum(root)).toThrow('Invalid cases');
  });

  it('rejects mismatched case result kinds and capstone reasoning omissions', () => {
    const root = fixture();
    replace(root, `${snapshot}/tests.ts`, 'expectedOutput:', 'expected:');
    expect(() => validateCurriculum(root)).toThrow('Invalid cases');
    writeFileSync(
      join(root, snapshot, 'tests.ts'),
      readFileSync(join(source, snapshot, 'tests.ts')),
    );
    replace(
      root,
      `${quest}/quest.yaml`,
      'kind: instructional',
      'kind: capstone',
    );
    expect(() => validateCurriculum(root)).toThrow(
      'Capstone requires separate',
    );
  });

  it('rejects unknown concepts, outcomes, current versions, and child inventories', () => {
    for (const [file, before, after] of [
      [`${snapshot}/version.yaml`, 'js-values', 'unknown-concept'],
      [`${snapshot}/version.yaml`, 'outcomeId: O1', 'outcomeId: O9'],
      [`${quest}/quest.yaml`, 'currentVersion: 1.0.0', 'currentVersion: 2.0.0'],
      ['journeys/javascript-foundations/journey.yaml', '  - CH01', '  - CH99'],
    ]) {
      const root = fixture();
      replace(root, file, before, after);
      expect(() => validateCurriculum(root)).toThrow();
    }
  });

  it('rejects self and missing prerequisites and XP-gated unlock fields', () => {
    for (const prerequisite of ['Q01', 'Q99']) {
      const root = fixture();
      replace(
        root,
        `${snapshot}/version.yaml`,
        'prerequisiteQuestIds: []',
        `prerequisiteQuestIds: [${prerequisite}]`,
      );
      expect(() => validateCurriculum(root)).toThrow();
    }
    const root = fixture();
    replace(
      root,
      `${quest}/quest.yaml`,
      'kind: instructional',
      'kind: instructional\nxpUnlockThreshold: 10',
    );
    expect(() => validateCurriculum(root)).toThrow('Invalid metadata');
  });

  it('rejects duplicate stable quest IDs and prerequisite cycles', () => {
    const root = fixture();
    const chapter = 'journeys/javascript-foundations/chapters/variables';
    const addQuest = (
      slug: string,
      id: string,
      position: number,
      prerequisite: string,
    ) => {
      const path = `${chapter}/quests/${slug}`;
      cpSync(join(root, quest), join(root, path), { recursive: true });
      replace(root, `${path}/quest.yaml`, 'id: Q01', `id: ${id}`);
      replace(
        root,
        `${path}/quest.yaml`,
        'slug: first-message',
        `slug: ${slug}`,
      );
      replace(
        root,
        `${path}/quest.yaml`,
        'position: 1',
        `position: ${position}`,
      );
      replace(
        root,
        `${path}/versions/1.0.0/version.yaml`,
        'prerequisiteQuestIds: []',
        `prerequisiteQuestIds: [${prerequisite}]`,
      );
    };
    addQuest('second-message', 'Q01', 2, 'Q01');
    replace(root, `${chapter}/chapter.yaml`, '  - Q01', '  - Q01\n  - Q01');
    expect(() => validateCurriculum(root)).toThrow();
    replace(
      root,
      `${chapter}/quests/second-message/quest.yaml`,
      'id: Q01',
      'id: Q02',
    );
    replace(
      root,
      `${chapter}/chapter.yaml`,
      '  - Q01\n  - Q01',
      '  - Q01\n  - Q02',
    );
    addQuest('third-message', 'Q03', 3, 'Q02');
    replace(root, `${chapter}/chapter.yaml`, '  - Q02', '  - Q02\n  - Q03');
    replace(
      root,
      `${chapter}/quests/second-message/versions/1.0.0/version.yaml`,
      'prerequisiteQuestIds: [Q01]',
      'prerequisiteQuestIds: [Q01, Q03]',
    );
    expect(() => validateCurriculum(root)).toThrow('Prerequisite cycle');
  });

  it('rejects a changed assessment without a new assessment version or transition', () => {
    const root = fixture();
    cpSync(join(root, snapshot), join(root, quest, 'versions/1.0.1'), {
      recursive: true,
    });
    replace(
      root,
      `${quest}/versions/1.0.1/version.yaml`,
      'contentVersion: 1.0.0',
      'contentVersion: 1.0.1',
    );
    replace(
      root,
      `${quest}/versions/1.0.1/tests.ts`,
      'I am ready to code!',
      'Different expected output',
    );
    replace(
      root,
      `${quest}/quest.yaml`,
      'currentVersion: 1.0.0',
      `currentVersion: 1.0.1\ntransitions:\n  - from: 1.0.0\n    to: 1.0.1\n    fromAssessment: 1.0.0\n    toAssessment: 1.0.0\n    compatibility: compatible\n    pendingWork: accept-new\n    reason: Editorial review\n    curriculumReview: pending\n    technicalReview: pending`,
    );
    replace(root, `${quest}/quest.yaml`, 'transitions: []', '');
    expect(() => validateCurriculum(root)).toThrow(
      'Changed criteria require a new assessment version',
    );
    replace(
      root,
      `${quest}/versions/1.0.1/version.yaml`,
      'assessmentVersion: 1.0.0',
      'assessmentVersion: 1.0.1',
    );
    replace(
      root,
      `${quest}/quest.yaml`,
      'toAssessment: 1.0.0',
      'toAssessment: 1.0.1',
    );
    expect(() => validateCurriculum(root)).not.toThrow();
  });

  it('requires an explicit transition for each added snapshot', () => {
    const root = fixture();
    cpSync(join(root, snapshot), join(root, quest, 'versions/1.0.1'), {
      recursive: true,
    });
    replace(
      root,
      `${quest}/versions/1.0.1/version.yaml`,
      'contentVersion: 1.0.0',
      'contentVersion: 1.0.1',
    );
    replace(
      root,
      `${quest}/quest.yaml`,
      'currentVersion: 1.0.0',
      'currentVersion: 1.0.1',
    );
    expect(() => validateCurriculum(root)).toThrow(
      'Every adjacent version needs one transition',
    );
  });

  it('rejects starter dependencies and executable capabilities', () => {
    const root = fixture();
    writeFileSync(
      join(root, snapshot, 'starter.js'),
      'fetch("https://example.com")',
    );
    expect(() => validateCurriculum(root)).toThrow('outside Foundations');
    writeFileSync(
      join(root, snapshot, 'starter.js'),
      'async function run() { await Promise.resolve(); }',
    );
    expect(() => validateCurriculum(root)).toThrow('outside Foundations');
  });

  it('requires retry guidance for incompatible version decisions', () => {
    const transition = {
      from: '1.0.0',
      to: '1.0.1',
      fromAssessment: '1.0.0',
      toAssessment: '1.0.1',
      compatibility: 'incompatible',
      pendingWork: 'retry-current',
      reason: 'Criteria changed',
      curriculumReview: 'pending',
      technicalReview: 'pending',
    };
    expect(transitionSchema.safeParse(transition).success).toBe(false);
    expect(
      transitionSchema.safeParse({
        ...transition,
        retryGuidance: 'Retry against the current version.',
      }).success,
    ).toBe(true);
  });

  it('accepts bounded function cases and rejects executable expected values', () => {
    const value = {
      id: 'empty-input',
      kind: 'function',
      category: 'boundary',
      functionName: 'summarize',
      args: [[]],
      expected: { total: 0 },
      feedback: 'Check the empty collection.',
    };
    expect(caseSchema.safeParse(value).success).toBe(true);
    expect(caseSchema.safeParse({ ...value, expected: () => 0 }).success).toBe(
      false,
    );
  });

  it('rejects wrong Foundations order and guest eligibility', () => {
    const root = fixture();
    replace(
      root,
      `${quest}/quest.yaml`,
      'guestEligible: true',
      'guestEligible: false',
    );
    expect(() => validateCurriculum(root)).toThrow('guest subset');
    replace(
      root,
      `${quest}/quest.yaml`,
      'guestEligible: false',
      'guestEligible: true',
    );
    replace(root, `${quest}/quest.yaml`, 'position: 1', 'position: 2');
    expect(() => validateCurriculum(root)).toThrow('chapter or sequence');
  });

  it('returns a nonzero CLI status for malformed temporary content without credentials', () => {
    const root = fixture();
    writeFileSync(join(root, 'concepts.yaml'), 'concepts: [');
    const result = spawnSync(
      process.execPath,
      [
        resolve(process.cwd(), 'node_modules/tsx/dist/cli.mjs'),
        resolve(
          process.cwd(),
          'src/modules/curriculum/content/validate-cli.ts',
        ),
      ],
      {
        cwd: process.cwd(),
        env: { PATH: process.env.PATH, CODEQUEST_CONTENT_ROOT: root },
        encoding: 'utf8',
      },
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Invalid YAML');
  });

  it('does not echo credential-like malformed metadata values', () => {
    const root = fixture();
    const secret = 'postgresql://user:private-password@example.invalid/db';
    replace(
      root,
      `${snapshot}/version.yaml`,
      'xpAward: 10',
      `xpAward: ${secret}`,
    );
    expect(() => validateCurriculum(root)).toThrow('xpAward');
    try {
      validateCurriculum(root);
    } catch (error) {
      expect(String(error)).not.toContain(secret);
    }
  });
});
