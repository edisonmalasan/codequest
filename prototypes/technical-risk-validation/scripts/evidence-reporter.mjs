import { mkdirSync, writeFileSync, readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

export default class EvidenceReporter {
  cases = [];
  buildHashes = {};
  onBegin() {
    const root = fileURLToPath(new URL('../dist/', import.meta.url));
    const walk = directory => {
      for (const item of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, item.name);
        if (item.isDirectory()) walk(path);
        else this.buildHashes[relative(root, path).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(path)).digest('hex');
      }
    };
    walk(root);
    this.buildFrozenAt = new Date().toISOString();
  }
  onTestEnd(test, result) {
    this.cases.push({
      title: test.titlePath().join(' / '), status: result.status, expectedStatus: test.expectedStatus,
      durationMs: result.duration, errors: result.errors.map((error) => (error.message ?? '').slice(0, 1500)),
      evidence: result.attachments.filter((item) => item.contentType === 'application/json' && item.body).map((item) => ({ name: item.name, data: JSON.parse(item.body.toString()) })),
    });
  }
  onEnd(result) {
    const directory = fileURLToPath(new URL('../../../docs/technical-risk-validation/evidence/', import.meta.url));
    mkdirSync(directory, { recursive: true });
    const recordedAt = new Date().toISOString();
    writeFileSync(directory + `automated-${recordedAt.replaceAll(':', '-')}.json`, JSON.stringify({
      recordedAt, commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      dirtyPaths: execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().split('\n'),
      command: process.argv.slice(1), environment: { platform: os.platform(), release: os.release(), cpu: os.cpus()[0]?.model, node: process.version, nodeOptions: process.env.NODE_OPTIONS ?? '', skipHostDependencyPreflight: process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS === '1', installedChrome: process.env.PHASE1_INSTALLED_CHROME === '1', mode: process.env.PHASE1_INSTALLED_CHROME === '1' ? 'headed installed Windows Chrome; automated interaction, not physical typing or assistive technology' : 'headless automated browser; no physical/manual claim', chromiumArgs: process.env.PHASE1_INSTALLED_CHROME === '1' ? [] : ['--disable-gpu', '--renderer-process-limit=2'], traces: 'off; bounded JSON evidence instead' },
      buildFrozenAt: this.buildFrozenAt, buildHashesFrozenBeforeTrials: this.buildHashes,
      status: result.status, durationMs: result.duration, cases: this.cases,
    }, null, 2) + '\n');
  }
}
