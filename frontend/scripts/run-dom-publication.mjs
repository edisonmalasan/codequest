import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const directory = mkdtempSync(join(tmpdir(), 'codequest-dom-publication-'));
const certificate = join(directory, 'auth-cert.pem');
const key = join(directory, 'auth-key.pem');
const openssl =
  process.platform === 'win32'
    ? 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe'
    : 'openssl';

try {
  const created = spawnSync(
    openssl,
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-sha256',
      '-nodes',
      '-keyout',
      key,
      '-out',
      certificate,
      '-days',
      '1',
      '-subj',
      '/CN=localhost',
      '-addext',
      'subjectAltName=DNS:localhost',
    ],
    { stdio: 'ignore' },
  );
  if (created.error || created.status !== 0)
    throw new Error('Could not create ephemeral HTTPS test certificate');

  const playwright = spawnSync(
    process.execPath,
    [
      join('node_modules', '@playwright', 'test', 'cli.js'),
      'test',
      '--config',
      'playwright.dom-publication.config.ts',
      ...process.argv.slice(2),
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        CODEQUEST_DOM_AUTH_CERT: certificate,
        CODEQUEST_DOM_AUTH_KEY: key,
        NODE_EXTRA_CA_CERTS: certificate,
      },
    },
  );
  if (playwright.error) throw playwright.error;
  process.exitCode = playwright.status ?? 1;
} finally {
  const safeRoot = resolve(tmpdir());
  if (!resolve(directory).startsWith(`${safeRoot}${sep}`))
    throw new Error(
      'Refusing to remove test files outside temporary directory',
    );
  rmSync(directory, { recursive: true, force: true });
}
