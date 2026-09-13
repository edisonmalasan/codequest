import { spawn, execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

if (process.argv.includes('--child')) {
  const server = spawn(process.execPath, ['--max-old-space-size=96', 'scripts/serve.mjs'], { windowsHide: true, stdio: 'ignore' });
  let browser;
  try {
    for (let attempt = 0; attempt < 40; attempt++) {
      try { if ((await fetch('http://127.0.0.1:4310')).ok) break; } catch { /* bounded startup polling */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({ args: ['--disable-gpu', '--renderer-process-limit=2'], timeout: 15000 });
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:4310/?framePolicy=none');
    await page.waitForFunction(() => Boolean(window.__risk));
    process.stdout.write('PROBE_STARTED\n');
    const result = await page.evaluate(() => window.__risk.preview('<script>while(true){}</script>'));
    const usable = await page.getByRole('heading', { name: 'CodeQuest validation workspace' }).isVisible();
    process.stdout.write(JSON.stringify({ result, hostUsable: usable, policyPassed: usable && result.elapsed < 3000 }) + '\n');
  } finally {
    await browser?.close();
    if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else server.kill('SIGTERM');
  }
} else {
  const child = spawn(process.execPath, ['--max-old-space-size=128', 'scripts/preview-watchdog.mjs', '--child'], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '', errors = '', expired = false, started = false;
  let timer;
  const kill = () => {
    expired = true;
    if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else child.kill('SIGKILL');
  };
  timer = setTimeout(kill, 30000);
  child.stdout.on('data', bytes => {
    output = (output + bytes).slice(-4000);
    if (!started && output.includes('PROBE_STARTED')) { started = true; clearTimeout(timer); timer = setTimeout(kill, 8000); }
  });
  child.stderr.on('data', bytes => { errors = (errors + bytes).slice(-2000); });
  const code = await new Promise(resolve => child.on('exit', resolve));
  clearTimeout(timer);
  const record = { recordedAt: new Date().toISOString(), fixture: 'E04-tight-loop', command: process.argv, physical: false, probeStarted: started, watchdogExpired: expired, code, output, errors, verdict: expired && started ? 'failed: owned process termination required' : code === 0 ? 'passed automated case only' : 'inconclusive: environment failure' };
  await writeFile(new URL('../../../docs/technical-risk-validation/evidence/preview-loop-' + record.recordedAt.replaceAll(':', '-') + '.json', import.meta.url), JSON.stringify(record, null, 2));
  process.stdout.write(JSON.stringify(record));
}
