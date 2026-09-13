import { chromium, firefox, webkit, expect } from '@playwright/test';
import { spawn, execFileSync } from 'node:child_process';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Avoid the test-runner worker process on memory-constrained machines.
const directory = new URL('../../../docs/technical-risk-validation/evidence/', import.meta.url);
await mkdir(directory, { recursive: true });
const rows = [];
const assets = {};
for (const name of ['index.html', 'worker.js', 'bootstrap.html', 'bootstrap.js', 'sw.js', '.vite/manifest.json']) {
  assets[name] = createHash('sha256').update(await readFile(new URL('../dist/' + name, import.meta.url))).digest('hex');
}
const startedAt = new Date().toISOString();
const server = spawn(process.execPath, ['--max-old-space-size=96', 'scripts/serve.mjs'], { cwd: new URL('../', import.meta.url), windowsHide: true, stdio: 'ignore' });
const timer = setTimeout(() => { process.stderr.write('Outer watchdog expired\n'); stop(); process.exit(2); }, 180000);
function stop() {
  clearTimeout(timer);
  if (server.exitCode === null) {
    if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
    else server.kill('SIGTERM');
  }
}
async function probe(id, operation) {
  const start = Date.now();
  try { const evidence = await operation(); rows.push({ id, status: 'passed', durationMs: Date.now() - start, evidence }); }
  catch (error) { rows.push({ id, status: 'failed', durationMs: Date.now() - start, error: String(error).slice(0, 2000) }); }
}
try {
  for (let attempt = 0; attempt < 40; attempt++) {
    try { if ((await fetch('http://127.0.0.1:4310')).ok) break; } catch { /* bounded startup polling */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    let browser;
    try { browser = await engine.launch({ headless: true, timeout: 15000, ...(name === 'chromium' ? { args: ['--disable-gpu', '--renderer-process-limit=2'] } : {}) }); }
    catch (error) { rows.push({ id: name + '/availability', status: 'untested', error: String(error).slice(0, 2000) }); continue; }
    const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4310' });
    try {
      const page = await context.newPage();
      await page.goto('/');
      await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
      rows.push({ id: name + '/availability', status: 'passed', version: browser.version(), physical: false });
      await probe(name + '/corrected-message-regression', async () => {
        const result = await page.evaluate(() => window.__risk.run(`console.log(${JSON.stringify('<script>parent.document.body.innerHTML="bad"</script>')})`, 'opaque'));
        expect(result.status).toBe('success');
        await expect(page.getByRole('heading', { name: 'CodeQuest validation workspace' })).toBeVisible();
        return result;
      });
      await probe(name + '/owner-switch-regression', async () => {
        await page.getByRole('textbox', { name: 'JavaScript source' }).fill('console.log("Ready for CodeQuest");');
        await page.getByRole('button', { name: 'Check', exact: true }).click();
        await expect(page.getByTestId('feedback')).toContainText('Local check passed');
        await page.getByRole('button', { name: 'Save pending snapshot' }).click();
        await expect(page.getByTestId('feedback')).toContainText('Snapshot pending');
        await page.getByRole('textbox', { name: 'JavaScript source' }).fill('console.log("later draft")');
        expect((await page.evaluate(() => window.__risk.pending()))[0].source).toContain('Ready for CodeQuest');
        await page.getByLabel('Owner').selectOption('account-A');
        await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
        await page.getByRole('button', { name: 'Explicitly import guest snapshot' }).click();
        await expect(page.getByTestId('feedback')).toContainText('accepted:');
        await page.getByLabel('Owner').selectOption('guest');
        await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toContainText('later draft');
        return { immutable: true, ownerDraftPreserved: true, explicitImport: true };
      });
      await probe(name + '/record-fixture', async () => {
        const result = await page.evaluate(() => window.__risk.run('function summarize(records){return records.reduce((sum,record)=>sum+record.quantity,0)}', 'opaque', 'RECORDS'));
        expect(result.status).toBe('success'); expect(result.value).toBe('5'); return result;
      });
      await probe(name + '/parent-frame-policy', async () => {
        await page.goto('/?framePolicy=none');
        await fetch('http://127.0.0.1:4312/reset', { method: 'POST' });
        const worker = await page.evaluate(() => window.__risk.run('console.log("ready")', 'opaque'));
        const preview = await page.evaluate(() => window.__risk.preview('<h1>Shell</h1><script>location.href="http://127.0.0.1:4312/parent-policy?fixture=PARENT_CSP"</script>'));
        const requests = await (await fetch('http://127.0.0.1:4312/records')).json();
        return { worker, preview, requests, policyPassed: worker.status === 'success' && requests.length === 0, diagnosticOnly: true };
      });
      await probe(name + '/100-worker-cycles', async () => {
        await page.goto('/');
        const timings = await page.evaluate(async () => {
          const results = [];
          for (let cycle = 0; cycle < 100; cycle++) results.push({ cycle, ...await window.__risk.run('console.log("cycle")', 'opaque') });
          return results;
        });
        expect(timings.every(row => row.status === 'success')).toBe(true);
        return { timings, hardMemoryQuota: 'unverified', physical: false };
      });
    } catch (error) { rows.push({ id: name + '/environment', status: 'failed', error: String(error).slice(0, 2000) }); }
    finally { await context.close().catch(() => {}); await browser.close().catch(() => {}); }
  }
} finally {
  stop();
  await writeFile(new URL('serial-' + startedAt.replaceAll(':', '-') + '.json', directory), JSON.stringify({ startedAt, command: process.argv, node: process.version, buildHashesFrozenBeforeThisRun: assets, physical: false, rows }, null, 2));
}
process.stdout.write(JSON.stringify(rows.map(({ id, status, error }) => ({ id, status, error })), null, 2));
process.exitCode = rows.some(row => row.status === 'failed') ? 1 : 0;
