import {
  existsSync,
  lstatSync,
  mkdtempSync,
  openSync,
  realpathSync,
  readFileSync,
  rmSync,
  writeFileSync,
  closeSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from 'node:path';
import { spawnSync } from 'node:child_process';
import { authorQuestFixture } from './author-quest-fixture';
import {
  loadAuthorCatalog,
  selectJourney,
  selectQuest,
} from './author-selection';
import { renderJourneyPreview, renderQuestPreview } from './author-preview';
import { ContentError } from './static-files';

type Mode = 'quest' | 'course' | 'test';
type Arguments = Readonly<Record<string, string>>;

function parseArguments(argv: string[]): { mode: Mode; options: Arguments } {
  const [mode, ...tokens] = argv;
  if (mode !== 'quest' && mode !== 'course' && mode !== 'test')
    throw new ContentError('arguments', 'Expected quest, course, or test mode');
  const allowed = new Set(
    mode === 'course'
      ? ['id', 'out']
      : mode === 'quest'
        ? ['id', 'version', 'out']
        : ['id', 'version', 'source', 'html', 'css', 'expect'],
  );
  const options: Record<string, string> = {};
  for (let index = 0; index < tokens.length; index += 2) {
    const flag = tokens[index];
    const value = tokens[index + 1];
    if (
      !flag?.startsWith('--') ||
      !allowed.has(flag.slice(2)) ||
      !value ||
      value.startsWith('--') ||
      options[flag.slice(2)]
    )
      throw new ContentError(
        'arguments',
        'Invalid, duplicate, or missing option',
      );
    options[flag.slice(2)] = value;
  }
  for (const required of mode === 'test'
    ? ['id', 'version', 'source', 'expect']
    : ['id', 'out'])
    if (!options[required])
      throw new ContentError('arguments', `Missing --${required}`);
  if (mode === 'quest' && !options.version)
    throw new ContentError(
      'arguments',
      'Specify --version current or an exact content version',
    );
  if (mode === 'test' && !['pass', 'fail'].includes(options.expect))
    throw new ContentError('arguments', 'Expected --expect pass or fail');
  return { mode, options };
}

function runHistoryGate(backendRoot: string): void {
  const result = spawnSync(
    process.execPath,
    ['scripts/check-curriculum-history.mjs'],
    { cwd: backendRoot, encoding: 'utf8', timeout: 30_000 },
  );
  if (result.status !== 0)
    throw new ContentError(
      'content history',
      (result.stderr || result.stdout || 'History check failed')
        .trim()
        .slice(0, 300),
    );
}

function writePreview(contentRoot: string, output: string, html: string): void {
  const target = resolve(output);
  const parent = dirname(target);
  if (!existsSync(parent) || !lstatSync(parent).isDirectory())
    throw new ContentError(
      'output',
      'Output parent directory is missing or unsafe',
    );
  const relation = relative(
    realpathSync(contentRoot),
    join(realpathSync(parent), basename(target)),
  );
  if (
    !isAbsolute(output) ||
    !target.toLowerCase().endsWith('.html') ||
    relation === '' ||
    (!relation.startsWith(`..${sep}`) &&
      relation !== '..' &&
      !isAbsolute(relation))
  )
    throw new ContentError(
      'output',
      'Use an absolute new .html path outside backend/content',
    );
  if (existsSync(target))
    throw new ContentError(
      'output',
      'Output already exists or parent directory is missing',
    );
  const descriptor = openSync(target, 'wx', 0o600);
  let failure: unknown;
  try {
    writeFileSync(descriptor, html, 'utf8');
  } catch (error) {
    failure = error;
  } finally {
    closeSync(descriptor);
  }
  if (failure) {
    rmSync(target, { force: true });
    throw failure;
  }
  process.stdout.write(`${target}\n`);
}

function candidateSource(
  path: string,
  extension: '.js' | '.html' | '.css',
  limit: number,
  contentRoot: string,
): string {
  const absolute = resolve(path);
  const relation = relative(realpathSync(contentRoot), absolute);
  if (
    !isAbsolute(path) ||
    !absolute.endsWith(extension) ||
    !existsSync(absolute) ||
    !lstatSync(absolute).isFile() ||
    lstatSync(absolute).isSymbolicLink() ||
    lstatSync(absolute).size > limit ||
    relation === '' ||
    (!relation.startsWith(`..${sep}`) &&
      relation !== '..' &&
      !isAbsolute(relation)) ||
    realpathSync(absolute) !== absolute
  )
    throw new ContentError(
      'source',
      `Use an absolute regular ${extension} file outside backend/content no larger than ${limit} bytes`,
    );
  const source = readFileSync(absolute, 'utf8');
  if (!source.trim())
    throw new ContentError('source', 'Candidate source is empty');
  return source;
}

function runBrowser(backendRoot: string, fixture: unknown): void {
  const folder = mkdtempSync(join(tmpdir(), 'codequest-author-'));
  const path = join(folder, 'fixture.json');
  try {
    writeFileSync(path, JSON.stringify(fixture), { flag: 'wx', mode: 0o600 });
    const frontendRoot = resolve(backendRoot, '../frontend');
    const result = spawnSync(
      process.execPath,
      [
        resolve(frontendRoot, 'node_modules/@playwright/test/cli.js'),
        'test',
        'e2e/content-authoring.spec.ts',
        '--config=playwright.authoring.config.ts',
      ],
      {
        cwd: frontendRoot,
        env: {
          ...process.env,
          CODEQUEST_AUTHOR_FIXTURE: path,
          CODEQUEST_AUTHOR_OUTPUT: join(folder, 'playwright-results'),
        },
        stdio: 'inherit',
        timeout: 180_000,
      },
    );
    if (result.error || result.status !== 0)
      throw new ContentError(
        'candidate test',
        `Browser Check failed (${result.error?.message ?? result.status ?? 'timeout'})`,
      );
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

function main(): void {
  const { mode, options } = parseArguments(process.argv.slice(2));
  const backendRoot = process.cwd();
  const contentRoot = resolve(
    process.env.CODEQUEST_CONTENT_ROOT ?? join(backendRoot, 'content'),
  );
  const catalog = loadAuthorCatalog(contentRoot);
  runHistoryGate(backendRoot);
  if (mode === 'course') {
    writePreview(
      contentRoot,
      options.out,
      renderJourneyPreview(catalog, selectJourney(catalog, options.id)),
    );
    return;
  }
  const selected = selectQuest(catalog, options.id, options.version);
  if (mode === 'quest') {
    writePreview(contentRoot, options.out, renderQuestPreview(selected));
    return;
  }
  const quest = authorQuestFixture(catalog, selected);
  const exerciseMode = quest.exercise?.mode ?? 'javascript';
  const interactive = exerciseMode === 'interactive-web';
  const hasCss =
    quest.exercise?.files.some((file) => file.language === 'css') ?? false;
  if (Boolean(options.html) !== interactive)
    throw new ContentError(
      'arguments',
      interactive
        ? 'Selected interactive Quest requires --html'
        : '--html is only valid for an interactive Quest',
    );
  if (Boolean(options.css) !== (hasCss && exerciseMode !== 'javascript'))
    throw new ContentError(
      'arguments',
      hasCss && exerciseMode !== 'javascript'
        ? 'Selected web Quest requires --css'
        : '--css is only valid for a web Quest with a CSS file',
    );
  const source = candidateSource(
    options.source,
    exerciseMode === 'static-web' ? '.html' : '.js',
    65_536,
    contentRoot,
  );
  const cssSource = options.css
    ? candidateSource(options.css, '.css', 32_768, contentRoot)
    : undefined;
  const htmlSource = options.html
    ? candidateSource(options.html, '.html', 65_536, contentRoot)
    : undefined;
  if (quest.cases.length > 10)
    throw new ContentError(
      'candidate test',
      'Selected Quest exceeds the browser Check limit of 10 cases',
    );
  runBrowser(backendRoot, {
    quest,
    source,
    htmlSource,
    cssSource,
    expected: options.expect,
    version: selected.snapshot.metadata.contentVersion,
    published: selected.isPublishedSelection,
  });
}

try {
  main();
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message.slice(0, 400) : 'Author tool failed'}\n`,
  );
  process.exitCode = 1;
}
