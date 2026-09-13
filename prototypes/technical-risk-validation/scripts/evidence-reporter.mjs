import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

export default class EvidenceReporter {
  cases = [];
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
      command: process.argv.slice(1), environment: { platform: os.platform(), release: os.release(), cpu: os.cpus()[0]?.model, node: process.version, nodeOptions: process.env.NODE_OPTIONS ?? '', mode: 'headless automated browser; no physical/manual claim', chromiumArgs: ['--disable-gpu', '--renderer-process-limit=2'], traces: 'off; bounded JSON evidence instead' },
      status: result.status, durationMs: result.duration, cases: this.cases,
    }, null, 2) + '\n');
  }
}
