import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { authorQuestFixture } from './author-quest-fixture';
import {
  loadAuthorCatalog,
  selectJourney,
  selectQuest,
} from './author-selection';
import { renderJourneyPreview, renderQuestPreview } from './author-preview';
import { CurriculumService } from '../curriculum.service';

const source = resolve(process.cwd(), 'test/fixtures/curriculum-draft');
const realContent = resolve(process.cwd(), 'content');
const created: string[] = [];

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'codequest-author-test-'));
  created.push(root);
  cpSync(source, root, { recursive: true });
  return root;
}

afterEach(() => {
  for (const root of created.splice(0))
    rmSync(root, { recursive: true, force: true });
});

describe('local author selection and previews', () => {
  it('selects exact current and historical versions and compares the published DTO', () => {
    const catalog = loadAuthorCatalog(realContent);
    const current = selectQuest(catalog, 'Q01', 'current');
    const historical = selectQuest(catalog, 'first-message', '1.0.0');
    expect(current.snapshot.metadata.contentVersion).toBe('1.1.0');
    expect(current.isPublishedSelection).toBe(true);
    expect(historical.snapshot.metadata.contentVersion).toBe('1.0.0');
    expect(historical.isPublishedSelection).toBe(false);
    expect(authorQuestFixture(catalog, historical).contentVersion).toBe(
      '1.0.0',
    );
    expect(() => selectQuest(catalog, 'Q01', '9.0.0')).toThrow('not found');
    expect(() => selectQuest(catalog, '../Q01', 'current')).toThrow(
      'Invalid stable ID',
    );
    expect(() =>
      selectQuest(
        {
          ...catalog,
          authored: {
            ...catalog.authored,
            journeys: [
              catalog.authored.journeys[0],
              catalog.authored.journeys[0],
            ],
          },
        },
        'Q01',
        'current',
      ),
    ).toThrow('Ambiguous Quest');
    expect(authorQuestFixture(catalog, current)).toEqual(
      new CurriculumService(catalog.published).findQuest('first-message'),
    );
  });

  it('marks unpublished drafts and escapes author text without changing source', () => {
    const root = fixture();
    const versionFile = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0/version.yaml',
    );
    const snapshotRoot = resolve(versionFile, '..');
    const lessonFile = join(snapshotRoot, 'lesson.mdx');
    mkdirSync(join(snapshotRoot, 'assets'));
    writeFileSync(
      join(snapshotRoot, 'assets/example.png'),
      Buffer.from('bounded-image'),
    );
    writeFileSync(
      lessonFile,
      `${readFileSync(lessonFile, 'utf8')}\n\n![Example](./assets/example.png)\n`,
    );
    const sourceText = readFileSync(versionFile, 'utf8');
    writeFileSync(
      versionFile,
      sourceText.replace(
        'title: First message',
        'title: "<script>alert(1)</script>"',
      ),
    );
    const catalog = loadAuthorCatalog(root);
    const selection = selectQuest(catalog, 'Q01', 'current');
    const html = renderQuestPreview(selection);
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    expect(html).toContain("default-src 'none'");
    expect(html).toContain('Unapproved / unpublished');
    expect(html).toContain('Declarative cases');
    expect(html).toContain('data:image/png;base64,');
    expect(readFileSync(versionFile, 'utf8')).toBe(
      sourceText.replace(
        'title: First message',
        'title: "<script>alert(1)</script>"',
      ),
    );
  });

  it('renders ordered Journey inventory and exact publication state', () => {
    const catalog = loadAuthorCatalog(realContent);
    const selection = selectJourney(catalog, 'javascript-foundations');
    const html = renderJourneyPreview(catalog, selection);
    expect(html.indexOf('Q01')).toBeLessThan(html.indexOf('Q02'));
    expect(html).toContain('Authored review: reviewed');
    expect(html).toContain('current snapshot selected');
    expect(html).toContain('This outline does not show learner availability');
    expect(() => selectJourney(catalog, '../../content')).toThrow(
      'Invalid stable ID',
    );
  });

  it('rejects invalid authored trees before previewing', () => {
    const root = fixture();
    const file = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0/tests.ts',
    );
    rmSync(file);
    expect(() => loadAuthorCatalog(root)).toThrow('tests.ts');
  });

  it('rejects unsafe lesson links before rendering a preview', () => {
    const root = fixture();
    const file = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0/lesson.mdx',
    );
    writeFileSync(
      file,
      `${readFileSync(file, 'utf8')}\n\n[click](javascript:alert(1))\n`,
    );
    expect(() => loadAuthorCatalog(root)).toThrow('Unsafe link URL');
  });
});
