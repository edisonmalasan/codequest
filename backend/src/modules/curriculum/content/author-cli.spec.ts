import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
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

function runInContent(root: string, ...args: string[]) {
  return spawnSync(process.execPath, [cli, entry, ...args], {
    cwd: backendRoot,
    env: { ...process.env, CODEQUEST_CONTENT_ROOT: root },
    encoding: 'utf8',
    timeout: 180_000,
  });
}

function runInContentAsync(root: string, ...args: string[]) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>(
    (resolveResult, reject) => {
      const child = spawn(process.execPath, [cli, entry, ...args], {
        cwd: backendRoot,
        env: { ...process.env, CODEQUEST_CONTENT_ROOT: root },
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      const timeout = setTimeout(() => child.kill(), 180_000);
      child.once('error', reject);
      child.once('close', (status) => {
        clearTimeout(timeout);
        resolveResult({ status, stdout, stderr });
      });
    },
  );
}

function staticContent(): string {
  const root = join(directory, 'static-content');
  cpSync(resolve(backendRoot, 'test/fixtures/curriculum-draft'), root, {
    recursive: true,
    force: true,
  });
  const snapshot = join(
    root,
    'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0',
  );
  writeFileSync(
    join(snapshot, 'version.yaml'),
    `${readFileSync(join(snapshot, 'version.yaml'), 'utf8')}exercise:\n  schemaVersion: 1\n  mode: static-web\n  files:\n    - id: page\n      name: index.html\n      language: html\n      starterFile: starter.html\n    - id: style\n      name: style.css\n      language: css\n      starterFile: starter.css\n`,
  );
  writeFileSync(join(snapshot, 'starter.html'), '<h1 id="heading">Hello</h1>');
  writeFileSync(join(snapshot, 'starter.css'), 'h1 { color: red; }');
  writeFileSync(
    join(snapshot, 'tests.ts'),
    `export const cases = [\n  { id: 'normal-message', category: 'normal', kind: 'html-element', selector: '#heading', expectedText: 'Hello', feedback: 'Add the heading.' },\n  { id: 'boundary-exact-output', category: 'boundary', kind: 'css-declaration', selector: 'h1', property: 'color', expectedValue: 'blue', feedback: 'Use blue.' },\n];\n`,
  );
  return root;
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
  }, 90_000);

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

  it('requires bounded identified interactive files before starting a browser', () => {
    const source = join(directory, 'interactive.js');
    const html = join(directory, 'interactive.html');
    const css = join(directory, 'interactive.css');
    writeFileSync(source, 'console.log("candidate");');
    writeFileSync(html, '<p id="north">North</p>');
    writeFileSync(css, '.board { color: navy; }');
    const args = [
      'test',
      '--id',
      'DOM01',
      '--version',
      'current',
      '--source',
      source,
      '--expect',
      'pass',
    ];
    expect(run(...args).stderr).toContain('requires --html');
    expect(run(...args, '--html', html).stderr).toContain('requires --css');
    writeFileSync(html, 'x'.repeat(65_537));
    expect(run(...args, '--html', html, '--css', css).stderr).toContain(
      '65536 bytes',
    );
    writeFileSync(html, '<p id="north">North</p>');
    writeFileSync(css, 'x'.repeat(32_769));
    expect(run(...args, '--html', html, '--css', css).stderr).toContain(
      '32768 bytes',
    );
  }, 90_000);

  it('requires an HTML candidate for a static web Quest before starting a browser', () => {
    const source = join(directory, 'wrong-extension.js');
    writeFileSync(source, '<main id="page"></main>');
    const result = run(
      'test',
      '--id',
      'HTML01',
      '--version',
      'current',
      '--source',
      source,
      '--expect',
      'pass',
    );
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('.html');
  }, 30_000);

  it('rejects missing, symlinked, wrong-path and over-limit CSS candidates before browser launch', () => {
    const root = staticContent();
    const html = join(directory, 'candidate.html');
    const css = join(directory, 'candidate.css');
    writeFileSync(html, '<h1 id="heading">Hello</h1>');
    writeFileSync(css, 'h1 { color: blue; }');
    const args = [
      'test',
      '--id',
      'Q01',
      '--version',
      'current',
      '--source',
      html,
      '--expect',
      'pass',
    ];
    expect(runInContent(root, ...args).stderr).toContain('requires --css');
    const missing = runInContent(
      root,
      ...args,
      '--css',
      join(directory, 'missing.css'),
    );
    expect(missing.status).not.toBe(0);
    expect(missing.stderr).toContain('.css');
    if (process.platform !== 'win32') {
      const link = join(directory, 'linked.css');
      symlinkSync(css, link);
      const linked = runInContent(root, ...args, '--css', link);
      expect(linked.status).not.toBe(0);
      expect(linked.stderr).toContain('regular .css');
    }
    const inside = join(
      root,
      'journeys/javascript-foundations/courses/javascript-foundations/chapters/variables/quests/first-message/versions/1.0.0/starter.css',
    );
    const wrongPath = runInContent(root, ...args, '--css', inside);
    expect(wrongPath.status).not.toBe(0);
    expect(wrongPath.stderr).toContain('outside backend/content');
    writeFileSync(css, 'x'.repeat(32_769));
    const large = runInContent(root, ...args, '--css', css);
    expect(large.status).not.toBe(0);
    expect(large.stderr).toContain('32768 bytes');
  }, 180_000);

  it('checks a two-file static candidate in the browser without publishing it', async () => {
    const root = staticContent();
    const publication = join(root, 'publication.yaml');
    const before = readFileSync(publication, 'utf8');
    const html = join(directory, 'reference.html');
    const css = join(directory, 'reference.css');
    writeFileSync(html, '<h1 id="heading">Hello</h1>');
    writeFileSync(css, 'h1 { color: blue; }');
    const result = await runInContentAsync(
      root,
      'test',
      '--id',
      'Q01',
      '--version',
      'current',
      '--source',
      html,
      '--css',
      css,
      '--expect',
      'pass',
    );
    expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
    expect(result.stdout).toContain('Q01 content 1.0.0 / assessment 1.0.0');
    expect(result.stdout).toContain('normal-message:');
    expect(result.stdout).toContain('boundary-exact-output:');
    expect(readFileSync(publication, 'utf8')).toBe(before);
  }, 240_000);

  it('reports alternate and defective CSS candidate outcomes with exact versions', async () => {
    const root = staticContent();
    const publication = join(root, 'publication.yaml');
    const before = readFileSync(publication, 'utf8');
    const html = join(directory, 'alternative.html');
    const css = join(directory, 'alternative.css');
    writeFileSync(html, '<main><h1 id="heading">Hello</h1></main>');
    writeFileSync(css, 'h1 { color: red; color: BLUE; }');
    const args = [
      'test',
      '--id',
      'Q01',
      '--version',
      '1.0.0',
      '--source',
      html,
      '--css',
      css,
    ];
    const alternative = await runInContentAsync(
      root,
      ...args,
      '--expect',
      'pass',
    );
    expect(
      alternative.status,
      `${alternative.stdout}\n${alternative.stderr}`,
    ).toBe(0);
    expect(alternative.stdout).toContain(
      'Q01 content 1.0.0 / assessment 1.0.0',
    );
    expect(alternative.stdout).toContain('normal-message:');
    expect(alternative.stdout).toContain('boundary-exact-output:');
    expect(alternative.stdout.indexOf('normal-message:')).toBeLessThan(
      alternative.stdout.indexOf('boundary-exact-output:'),
    );
    writeFileSync(css, 'h1 { color: red; }');
    const defect = await runInContentAsync(root, ...args, '--expect', 'fail');
    expect(defect.status, `${defect.stdout}\n${defect.stderr}`).toBe(0);
    expect(defect.stdout).toContain('Q01 content 1.0.0 / assessment 1.0.0');
    expect(defect.stdout).toContain('boundary-exact-output:');
    const mismatch = await runInContentAsync(root, ...args, '--expect', 'pass');
    expect(mismatch.status).not.toBe(0);
    expect(mismatch.stdout).toContain('Q01 content 1.0.0 / assessment 1.0.0');
    expect(readFileSync(publication, 'utf8')).toBe(before);
  }, 240_000);
});
