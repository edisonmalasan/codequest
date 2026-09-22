import { execFileSync } from 'node:child_process';
import process from 'node:process';

function git(directory, ...args) {
  return execFileSync('git', args, {
    cwd: directory,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
}

export function rewrittenSnapshots(oldPaths, changedRecords) {
  return changedRecords.filter(
    ([status, path]) =>
      status !== 'A' &&
      oldPaths.has(path) &&
      path.startsWith('backend/content/') &&
      path.includes('/versions/'),
  );
}

export function checkHistory(directory = process.cwd()) {
  const base = git(directory, 'merge-base', 'HEAD', 'origin/main').trim();
  const oldPaths = new Set(
    git(
      directory,
      'ls-tree',
      '-r',
      '--name-only',
      '-z',
      base,
      '--',
      'backend/content/',
    )
      .split('\0')
      .filter(Boolean),
  );
  const fields = git(
    directory,
    'diff',
    '--name-status',
    '-z',
    '--no-renames',
    base,
    '--',
    'backend/content/',
  )
    .split('\0')
    .filter(Boolean);
  const records = [];
  for (let index = 0; index < fields.length; index += 2)
    records.push([fields[index], fields[index + 1]]);
  const rewrites = rewrittenSnapshots(oldPaths, records);
  if (rewrites.length)
    throw new Error(
      `Previously merged curriculum snapshots must not change: ${rewrites.map(([, path]) => path).join(', ')}`,
    );
}

if (process.argv[1]?.endsWith('check-curriculum-history.mjs')) {
  try {
    checkHistory();
    process.stdout.write('Curriculum snapshot history valid\n');
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : 'Curriculum history check failed'}\n`,
    );
    process.exitCode = 1;
  }
}
