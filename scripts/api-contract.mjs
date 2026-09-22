import { mkdtemp, rmdir, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

const mode = process.argv[2];
if (mode !== 'generate' && mode !== 'check') {
  process.stderr.write(
    'Usage: node scripts/api-contract.mjs <generate|check>\n',
  );
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
  });
  if (result.error !== undefined) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status}`);
  }
}

function runPnpm(args) {
  const pnpmPath = process.env.npm_execpath;
  if (pnpmPath === undefined) {
    throw new Error('Run this command through pnpm');
  }
  if (['.js', '.cjs', '.mjs'].includes(extname(pnpmPath).toLowerCase())) {
    run(process.execPath, [pnpmPath, ...args]);
  } else {
    run(pnpmPath, args);
  }
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), 'codequest-api-'));
const documentPath = join(temporaryDirectory, 'openapi.json');
try {
  runPnpm(['--dir', 'backend', 'build']);
  run('node', ['backend/dist/export-openapi.js', documentPath]);
  runPnpm([
    '--dir',
    'frontend',
    'exec',
    'openapi-typescript',
    documentPath,
    '--output',
    'src/lib/api/generated/schema.d.ts',
    ...(mode === 'check' ? ['--check'] : []),
  ]);
} finally {
  await unlink(documentPath).catch(() => undefined);
  await rmdir(temporaryDirectory);
}
