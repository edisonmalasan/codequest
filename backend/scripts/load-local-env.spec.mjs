/* global process, URL */

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

function createFixture(t, contents) {
  const directory = mkdtempSync(join(tmpdir(), 'codequest-local-env-'));
  const scripts = join(directory, 'scripts');
  const loader = join(scripts, 'load-local-env.mjs');
  const localFile = join(directory, '.env.local');
  mkdirSync(scripts);
  copyFileSync(
    fileURLToPath(new URL('./load-local-env.mjs', import.meta.url)),
    loader,
  );
  if (contents !== undefined) writeFileSync(localFile, contents);
  t.after(() => {
    if (contents !== undefined) unlinkSync(localFile);
    unlinkSync(loader);
    rmdirSync(scripts);
    rmdirSync(directory);
  });
  return loader;
}

function loadedValue(loader, nodeEnvironment, suppliedValue) {
  const environment = { ...process.env, NODE_ENV: nodeEnvironment };
  delete environment.CODEQUEST_LOCAL_ENV_TEST;
  if (suppliedValue !== undefined) {
    environment.CODEQUEST_LOCAL_ENV_TEST = suppliedValue;
  }
  const child = spawnSync(
    process.execPath,
    [
      '--import',
      pathToFileURL(loader).href,
      '--eval',
      "process.stdout.write(process.env.CODEQUEST_LOCAL_ENV_TEST ?? 'missing')",
    ],
    { env: environment, encoding: 'utf8' },
  );
  assert.equal(child.status, 0, child.stderr);
  return child.stdout;
}

test('backend local environment is optional when variables are supplied elsewhere', (t) => {
  const loader = createFixture(t);
  assert.equal(loadedValue(loader, 'development'), 'missing');
});

test('backend local file loads without overriding supplied variables', (t) => {
  const loader = createFixture(t, 'CODEQUEST_LOCAL_ENV_TEST=from-file\n');
  assert.equal(loadedValue(loader, 'development'), 'from-file');
  assert.equal(loadedValue(loader, 'development', 'from-shell'), 'from-shell');
});

test('production does not load the backend local file', (t) => {
  const loader = createFixture(t, 'CODEQUEST_LOCAL_ENV_TEST=from-file\n');
  assert.equal(loadedValue(loader, 'production'), 'missing');
});
