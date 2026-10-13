/* global console, process */

import { spawn } from 'node:child_process';

// Node supports --watch-path only on macOS and Windows.
const watchArguments =
  process.platform === 'win32' || process.platform === 'darwin'
    ? ['--watch-path=dist']
    : ['--watch'];

const child = spawn(
  process.execPath,
  [
    ...watchArguments,
    '--import',
    './scripts/load-local-env.mjs',
    'dist/main.js',
  ],
  { stdio: 'inherit' },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => child.kill(signal));
}

child.once('error', (error) => {
  console.error('Could not start the backend development watcher.', error);
  process.exitCode = 1;
});

child.once('close', (code) => {
  process.exitCode = code ?? 1;
});
