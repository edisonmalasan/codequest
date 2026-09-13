import { test, expect, type Page } from '@playwright/test';

async function edit(page: Page, source: string) {
  const editor = page.getByRole('textbox', { name: 'JavaScript source' });
  await editor.fill(source);
}
test.beforeEach(async ({ page }) => { await page.goto('/'); await expect(page.getByTestId('save-state')).toHaveText('Saved on this device'); });

test('E01/E06 read, run, failed check, hint, correction, provisional save and reload', async ({ page, browser }, info) => {
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByTestId('feedback')).toHaveText('success');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByTestId('feedback')).toContainText('Check failed');
  await page.getByRole('button', { name: 'Show hint' }).click();
  await expect(page.getByText('Change the text between the quotes')).toBeVisible();
  await edit(page, 'console.log("Ready for CodeQuest");');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByTestId('feedback')).toContainText('Local check passed');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toContainText('Ready for CodeQuest');
  await expect(page.getByText('Local provisional completion; not accepted account progress')).toBeVisible();
  await page.getByRole('textbox', { name: 'JavaScript source' }).focus(); await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeFocused();
  await info.attach('environment', { body: JSON.stringify({ browser: browser.version(), viewport: page.viewportSize(), physical: false }), contentType: 'application/json' });
});

test('E02 syntax/runtime errors, limits, termination, restart and stale output', async ({ page }, info) => {
  const fixtures = [
    ['syntax', 'const = ;', 'syntax-error'], ['error', 'throw new Error("fixture error")', 'runtime-error'],
    ['loop', 'while(true){}', 'timeout'], ['flood', 'for(let i=0;i<201;i++) console.log(i)', 'output-limit'],
    ['large', 'console.log("x".repeat(17000))', 'output-limit'], ['cycle', 'const a={};a.self=a;console.log(a)', 'output-limit'],
    ['getter', 'console.log({get danger(){while(true){}}})', 'success'],
    ['deep', 'const a={};let c=a;for(let i=0;i<20;i++){c.n={};c=c.n}console.log(a)', 'output-limit'],
    ['toJSON', 'console.log({toJSON(){throw Error("must not be called")},value:1})', 'success'],
    ['swallowed-limit', 'try{for(let i=0;i<201;i++)console.log(i)}catch(e){}', 'output-limit'],
    ['source-limit', ' '.repeat(65537), 'output-limit'],
    ['proxy', 'console.log(new Proxy({}, {ownKeys(){while(true){}}}))', 'timeout'],
  ];
  const evidence = [];
  for (const [id, source, expected] of fixtures) {
    if (!source) throw new Error('Missing fixture source');
    const result = await page.evaluate((input) => window.__risk.run(input, 'opaque'), source);
    expect(result.status, id).toBe(expected);
    expect(result.elapsed).toBeLessThan(3000);
    evidence.push({ id, ...result });
  }
  const restart = await page.evaluate(() => window.__risk.run('console.log("fresh")', 'opaque'));
  expect(restart.output).toEqual(['fresh']); expect(restart.elapsed).toBeLessThan(1000);
  const stale = await page.evaluate(async () => {
    const old = window.__risk.run('await new Promise(r=>setTimeout(r,800));console.log("stale")', 'opaque');
    const current = window.__risk.run('console.log("current")', 'opaque');
    return { old: await old, current: await current };
  });
  expect(stale.old.status).toBe('stopped'); expect(stale.current.output).toEqual(['current']);
  await info.attach('fixtures', { body: JSON.stringify(evidence), contentType: 'application/json' });
});

test('E05 storage failure is explicit and preserves in-memory source', async ({ page }) => {
  for (const failure of ['full', 'unavailable']) {
    await page.evaluate((kind) => window.__risk.saveFailure(kind), failure);
    await edit(page, `console.log("${failure} retained");`);
    await expect(page.getByTestId('save-state')).toContainText('Save failed');
    await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toContainText(failure + ' retained');
  }
  await page.evaluate(() => window.__risk.saveFailure(null));
  await edit(page, 'console.log("recovered")');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
});

test('E06 immutable pending source, owner isolation and explicit import', async ({ page }) => {
  await edit(page, 'console.log("Ready for CodeQuest");');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByTestId('feedback')).toContainText('Local check passed');
  await page.getByRole('button', { name: 'Save pending snapshot' }).click();
  await expect(page.getByTestId('feedback')).toContainText('Snapshot pending');
  await edit(page, 'console.log("later draft")');
  expect((await page.evaluate(() => window.__risk.pending()))[0]?.source).toContain('Ready for CodeQuest');
  await page.getByLabel('Owner').selectOption('account-A');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await expect(page.getByRole('textbox', { name: 'JavaScript source' })).not.toContainText('later draft');
  await page.getByRole('button', { name: 'Explicitly import guest snapshot' }).click();
  await expect(page.getByTestId('feedback')).toContainText('accepted:');
  await page.getByLabel('Owner').selectOption('guest');
  await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toContainText('later draft');
});

test('E05 saved source survives twenty reload cycles and protected response is not cached', async ({ page, request }) => {
  await edit(page, 'console.log("persistent source")');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  for (let cycle = 0; cycle < 20; cycle++) {
    await page.reload();
    await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
    await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toContainText('persistent source');
  }
  await request.get('/__protected', { headers: { Authorization: 'Bearer SYNTHETIC_ONLY' } });
  const cached = await page.evaluate(async () => {
    const urls: string[] = [];
    for (const key of await caches.keys()) for (const response of await (await caches.open(key)).keys()) urls.push(response.url);
    return urls;
  });
  expect(cached.some((url) => url.includes('__protected') || url.includes('__mock'))).toBe(false);
});

test('E01 editor undo, indentation, resize, task preservation and explicit reset', async ({ page }) => {
  const editor = page.getByRole('textbox', { name: 'JavaScript source' });
  await editor.fill('console.log("kept draft")');
  await editor.press('End'); await page.keyboard.type(';');
  await editor.press('Control+z');
  await expect(editor).toHaveText('console.log("kept draft")');
  await editor.press('Control+End'); await editor.press('Enter'); await editor.press('Tab');
  await expect(editor).toContainText('kept draft');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('button', { name: 'Run', exact: true })).toBeVisible();
  await page.getByLabel('Task').selectOption('RECORDS');
  await expect(editor).toContainText('function summarize');
  await page.getByLabel('Task').selectOption('Q01');
  await expect(editor).toContainText('kept draft');
  page.once('dialog', dialog => void dialog.dismiss());
  await page.getByRole('button', { name: 'Reset source' }).click();
  await expect(editor).toContainText('kept draft');
  page.once('dialog', dialog => void dialog.accept());
  await page.getByRole('button', { name: 'Reset source' }).click();
  await expect(editor).toContainText('Not ready');
});
