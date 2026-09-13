import { test, expect } from '@playwright/test';

test('E05 versioned lesson identity, missing resources and cleared task storage are truthful', async ({ page, context }, info) => {
  await page.goto('/');
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill('console.log("confirmed before clear")');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  const inventory = await page.evaluate(async () => {
    return new Promise<unknown>((resolve, reject) => {
      const open = indexedDB.open('codequest-risk-prototype');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const request = open.result.transaction('lessons').objectStore('lessons').getAll();
        request.onsuccess = () => { resolve(request.result); open.result.close(); }; request.onerror = () => reject(request.error);
      };
    });
  });
  expect(inventory).toEqual(expect.arrayContaining([expect.objectContaining({ key: 'Q01/1/1', hash: expect.stringMatching(/^[a-f0-9]{64}$/) })]));
  // Navigate away to close the application's Dexie connection before deleting only its synthetic database.
  await page.goto('/bootstrap.html');
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('codequest-risk-prototype');
      request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); request.onblocked = () => reject(new Error('Task database remained open'));
    });
  });
  await context.setOffline(true);
  await page.goto('/');
  await expect(page.getByText(/Offline lesson missing; any existing draft remains local/)).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toContainText('Not ready');
  await expect(page.getByText('No local completion', { exact: true })).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(page.getByText('Online · Public lesson and runtime assets prepared offline')).toBeVisible();
  await info.attach('task-storage-clearing', { body: JSON.stringify({ inventory, confirmedSourceLostAfterExplicitTaskDatabaseClear: true, missingLessonDisclosed: true, realQuotaExhaustion: 'not simulated by clearing; separately untested', physical: false }), contentType: 'application/json' });
});

test('E05 interrupted unconfirmed edit does not replace the last confirmed draft', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill('console.log("confirmed")');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.evaluate(() => window.__risk.saveFailure('unavailable'));
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill('console.log("not confirmed")');
  await expect(page.getByTestId('save-state')).toContainText('Save failed');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toHaveText('console.log("confirmed")');
  await info.attach('interrupted-save', { body: JSON.stringify({ previousConfirmedSourceRecovered: true, failedUnconfirmedEditLostOnReload: true, physicalBackgroundLifecycle: 'untested' }), contentType: 'application/json' });
});

test('E05 B09 eight reload, six update and six multiclient cycles retain source and pending identity', async ({ page, context, request }, info) => {
  test.setTimeout(120000);
  await page.goto('/');
  const source = 'console.log("Ready for CodeQuest");';
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill(source);
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByTestId('feedback')).toContainText('Local check passed');
  await page.getByRole('button', { name: 'Save pending snapshot' }).click();
  await expect(page.getByTestId('feedback')).toContainText('Snapshot pending');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  const initial = await page.evaluate(() => window.__risk.pending());
  const rows = [];
  for (const [mode, count] of [['reload', 8], ['update', 6], ['multiclient', 6]] as const) {
    for (let cycle = 0; cycle < count; cycle++) {
      let other;
      if (mode !== 'reload') {
        if (mode === 'multiclient') { other = await context.newPage(); await other.goto('/'); }
        await request.post('/__revision');
        await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration())?.update(); });
        const update = page.getByRole('button', { name: 'Save draft and apply available update' });
        await expect(update).toBeVisible();
        await update.click();
        await expect.poll(() => page.evaluate(async () => {
          const registration = await navigator.serviceWorker.getRegistration();
          return !registration?.waiting && registration?.active?.state === 'activated';
        })).toBe(true);
      }
      await page.reload();
      await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toHaveText(source);
      const pending = await page.evaluate(() => window.__risk.pending());
      expect(pending).toEqual(initial);
      if (other) {
        await other.reload();
        await expect(other.getByRole('textbox', { name: 'JavaScript source' })).toHaveText(source);
        await other.close();
      }
      rows.push({ mode, cycle, exactSourceRetained: true, pending });
    }
  }
  await info.attach('B09-cycle-mix', { body: JSON.stringify({ rows, physical: false, contentAssessmentRevision: 'identity remains 1/1; incompatible-version rejection tested separately in synthetic ledger', browserMode: 'headless same process; physical gate untested' }), contentType: 'application/json' });
});
