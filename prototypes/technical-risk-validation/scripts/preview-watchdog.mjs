import { spawn, execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

if (process.argv.includes('--child')) {
  const { chromium, firefox } = await import('@playwright/test');
  const server = spawn(process.execPath, ['--max-old-space-size=96', 'scripts/serve.mjs'], { windowsHide: true, stdio: 'ignore' });
  let browser;
  try {
    for (let attempt = 0; attempt < 40; attempt++) {
      try { if ((await fetch('http://127.0.0.1:4310')).ok) break; } catch { /* bounded startup polling */ }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const useFirefox = process.argv.includes('--firefox');
    const chromiumArgs = useFirefox || process.argv.includes('--default-browser') ? [] : ['--disable-gpu', '--renderer-process-limit=2'];
    browser = await (useFirefox ? firefox : chromium).launch({ args: chromiumArgs, timeout: 15000 });
    process.stdout.write(JSON.stringify({ browserName: useFirefox ? 'firefox' : 'chromium', browserVersion: browser.version(), chromiumArgs, skipHostDependencyPreflight: process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS === '1', physical: false }) + '\n');
    const page = await browser.newPage();
    const dedicated = process.argv.includes('--dedicated');
    await page.goto('http://127.0.0.1:4310/?framePolicy=' + (dedicated ? 'isolated' : 'none'));
    await page.waitForFunction(() => Boolean(window.__risk));
    await page.evaluate(dedicated => {
      window.__previewTrial = window.__risk.preview('<p id="execution-marker">Loop fixture loaded</p><script>document.body.dataset.executing="yes";setTimeout(()=>{while(true){}},500)</script>', dedicated ? 'dedicated' : 'opaque');
    }, dedicated);
    const learner = dedicated ? page.frameLocator('iframe[title="Sandboxed learner preview"]').frameLocator('iframe[title="Synthetic learner document"]') : page.frameLocator('iframe[title="Sandboxed learner preview"]');
    await learner.locator('body[data-executing="yes"]').waitFor({ timeout: 1500 });
    process.stdout.write('PROBE_STARTED\n');
    const result = await page.evaluate(() => window.__previewTrial);
    const usable = await page.getByRole('heading', { name: 'CodeQuest validation workspace' }).isVisible();
    process.stdout.write(JSON.stringify({ result, hostUsable: usable, policyPassed: usable && result.elapsed < 3000 }) + '\n');
  } finally {
    await browser?.close();
    if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else server.kill('SIGTERM');
  }
} else {
  const buildRoot = fileURLToPath(new URL('../dist/', import.meta.url));
  const hashes = {};
  const walk = directory => {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, item.name);
      if (item.isDirectory()) walk(path);
      else hashes[relative(buildRoot, path).replaceAll('\\', '/')] = createHash('sha256').update(readFileSync(path)).digest('hex');
    }
  };
  walk(buildRoot);
  const buildFrozenAt = new Date().toISOString();
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const dirtyPaths = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  const child = spawn(process.execPath, ['--max-old-space-size=128', 'scripts/preview-watchdog.mjs', '--child', ...process.argv.slice(2)], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
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
  const record = { recordedAt: new Date().toISOString(), fixture: 'E04-tight-loop', candidate: process.argv.includes('--dedicated') ? 'dedicated' : 'opaque', browserName: process.argv.includes('--firefox') ? 'firefox' : 'chromium', skipHostDependencyPreflight: process.env.PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS === '1', chromiumArgs: process.argv.includes('--firefox') || process.argv.includes('--default-browser') ? [] : ['--disable-gpu', '--renderer-process-limit=2'], commit, dirtyPaths, buildFrozenAt, buildHashesFrozenBeforeTrial: hashes, node: process.version, command: process.argv, physical: false, probeStarted: started, watchdogExpired: expired, code, output, errors, verdict: expired && started ? 'failed: owned process termination required' : code === 0 && output.includes('"policyPassed":true') ? 'passed automated case only' : started ? 'failed: trusted recovery budget not met' : 'inconclusive: environment failure' };
  await writeFile(new URL('../../../docs/technical-risk-validation/evidence/preview-loop-' + record.recordedAt.replaceAll(':', '-') + '.json', import.meta.url), JSON.stringify(record, null, 2));
  process.stdout.write(JSON.stringify(record));
}
