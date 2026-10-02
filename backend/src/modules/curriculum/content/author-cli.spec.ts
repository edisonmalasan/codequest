import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterAll, describe, expect, it } from 'vitest';

const backendRoot = process.cwd();
const directory = mkdtempSync(join(tmpdir(), 'codequest-author-cli-'));
const cli = resolve(backendRoot, 'node_modules/tsx/dist/cli.mjs');
const entry = resolve(
  backendRoot,
  'src/modules/curriculum/content/author-cli.ts',
);

function run(...args: string[]) {
  return spawnSync(process.execPath, [cli, entry, ...args], {
    cwd: backendRoot,
    encoding: 'utf8',
    timeout: 30_000,
  });
}

afterAll(() => rmSync(directory, { recursive: true, force: true }));

describe('author CLI', () => {
  it('writes readable Quest and Course previews once without touching publication', () => {
    const publication = resolve(backendRoot, 'content/publication.yaml');
    const before = readFileSync(publication, 'utf8');
    const questPath = join(directory, 'quest.html');
    const coursePath = join(directory, 'course.html');
    expect(
      run('quest', '--id', 'Q01', '--version', 'current', '--out', questPath)
        .status,
    ).toBe(0);
    expect(
      run('course', '--id', 'JAVASCRIPT-FOUNDATIONS', '--out', coursePath)
        .status,
    ).toBe(0);
    expect(readFileSync(questPath, 'utf8')).toContain('Declarative cases');
    expect(readFileSync(coursePath, 'utf8')).toContain('Q01');
    expect(readFileSync(publication, 'utf8')).toBe(before);
    expect(
      run('quest', '--id', 'Q01', '--version', 'current', '--out', questPath)
        .status,
    ).not.toBe(0);
  }, 30_000);

  it('rejects missing identity, traversal, and unknown options before output', () => {
    const output = join(directory, 'rejected.html');
    expect(
      run('quest', '--version', 'current', '--out', output).status,
    ).not.toBe(0);
    const traversal = run(
      'quest',
      '--id',
      '../Q01',
      '--version',
      'current',
      '--out',
      output,
    );
    expect(traversal.status).not.toBe(0);
    expect(traversal.stderr).toContain('Invalid stable ID');
    expect(
      run(
        'course',
        '--id',
        'JAVASCRIPT-FOUNDATIONS',
        '--out',
        output,
        '--unknown',
        'x',
      ).status,
    ).not.toBe(0);
    expect(existsSync(output)).toBe(false);
  }, 30_000);

  it('reports the authored path for a malformed validation fixture', () => {
    const root = join(directory, 'invalid-content');
    cpSync(resolve(backendRoot, 'test/fixtures/curriculum-draft'), root, {
      recursive: true,
    });
    rmSync(
      join(
        root,
        'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0/tests.ts',
      ),
    );
    const result = spawnSync(
      process.execPath,
      [
        cli,
        resolve(backendRoot, 'src/modules/curriculum/content/validate-cli.ts'),
      ],
      {
        cwd: backendRoot,
        env: { ...process.env, CODEQUEST_CONTENT_ROOT: root },
        encoding: 'utf8',
        timeout: 30_000,
      },
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('tests.ts');
  }, 30_000);

  it('rejects oversized candidate files before starting a browser', () => {
    const source = join(directory, 'oversized.js');
    writeFileSync(source, 'x'.repeat(65_537));
    const result = run(
      'test',
      '--id',
      'Q01',
      '--version',
      'current',
      '--source',
      source,
      '--expect',
      'pass',
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('65536 bytes');
  }, 30_000);
});
