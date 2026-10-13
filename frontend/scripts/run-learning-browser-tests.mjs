import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, rmdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);

function opensslExecutable() {
  const candidates = ['openssl'];
  if (process.platform === 'win32' && process.env.ProgramFiles) {
    candidates.push(
      join(process.env.ProgramFiles, 'Git', 'usr', 'bin', 'openssl.exe'),
      join(process.env.ProgramFiles, 'Git', 'mingw64', 'bin', 'openssl.exe'),
    );
  }
  for (const candidate of candidates) {
    if (candidate !== 'openssl' && !existsSync(candidate)) continue;
    const probe = spawnSync(candidate, ['version'], { encoding: 'utf8' });
    if (probe.status === 0) return candidate;
  }
  throw new Error('OpenSSL is required for the local HTTPS Auth test fixture');
}

const directory = await mkdtemp(join(tmpdir(), 'codequest-learning-auth-'));
const certificate = join(directory, 'auth-cert.pem');
const privateKey = join(directory, 'auth-key.pem');

try {
  const generated = spawnSync(
    opensslExecutable(),
    [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-sha256',
      '-nodes',
      '-days',
      '1',
      '-keyout',
      privateKey,
      '-out',
      certificate,
      '-subj',
      '/CN=127.0.0.1',
      '-addext',
      'subjectAltName=IP:127.0.0.1',
    ],
    { stdio: 'ignore' },
  );
  if (generated.status !== 0) {
    throw new Error('Could not generate the local HTTPS Auth test certificate');
  }

  const playwright = spawn(
    process.execPath,
    [
      require.resolve('@playwright/test/cli'),
      'test',
      '--config',
      'playwright.learning.config.ts',
      ...process.argv.slice(2),
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        CODEQUEST_AUTH_HTTPS_CERT: certificate,
        CODEQUEST_AUTH_HTTPS_KEY: privateKey,
        NODE_EXTRA_CA_CERTS: certificate,
      },
    },
  );
  const forwardInterrupt = () => playwright.kill('SIGINT');
  const forwardTermination = () => playwright.kill('SIGTERM');
  process.on('SIGINT', forwardInterrupt);
  process.on('SIGTERM', forwardTermination);
  const exitCode = await new Promise((resolve, reject) => {
    playwright.once('error', reject);
    playwright.once('exit', (code) => resolve(code ?? 1));
  });
  process.off('SIGINT', forwardInterrupt);
  process.off('SIGTERM', forwardTermination);
  process.exitCode = exitCode;
} finally {
  await rm(certificate, { force: true });
  await rm(privateKey, { force: true });
  await rmdir(directory);
}
