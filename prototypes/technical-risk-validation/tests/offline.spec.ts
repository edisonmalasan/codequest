import { test, expect } from '@playwright/test';

test('E05 prepared offline new page retains source and local JS', async ({ page, context }, info) => {
  await page.goto('/'); await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill('console.log("Ready for CodeQuest");');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await context.setOffline(true);
  const offlinePage = await context.newPage(); const start = Date.now();
  await page.close(); await offlinePage.goto('/');
  await expect(offlinePage.getByRole('textbox', { name: 'JavaScript source' })).toContainText('Ready for CodeQuest');
  await offlinePage.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(offlinePage.getByTestId('feedback')).toContainText('Local check passed');
  await info.attach('offline', { body: JSON.stringify({ elapsedMs: Date.now() - start, mode: 'new page, same browser process; physical cold process/install untested' }), contentType: 'application/json' });
  await context.setOffline(false);
});

test('E05 update waits, save failure blocks activation, and two clients retain drafts', async ({ page, context, request }, info) => {
  await page.goto('/'); await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.getByRole('textbox', { name: 'JavaScript source' }).fill('console.log("update preserved")');
  await expect(page.getByTestId('save-state')).toHaveText('Saved on this device');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  const other = await context.newPage(); await other.goto('/');
  await request.post('/__revision');
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration?.update(); });
  const update = page.getByRole('button', { name: 'Save draft and apply available update' });
  await expect(update).toBeVisible();
  await page.evaluate(() => window.__risk.saveFailure('full')); await update.click();
  await expect(page.getByTestId('feedback')).toContainText('Update paused');
  expect(await page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration())?.waiting))).toBe(true);
  await page.evaluate(() => window.__risk.saveFailure(null)); await update.click();
  await expect(page.getByTestId('feedback')).toContainText('Update requested');
  await expect.poll(() => page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return !registration?.waiting && registration?.active?.state === 'activated';
  })).toBe(true);
  await page.reload(); await other.reload();
  await expect(page.getByRole('textbox', { name: 'JavaScript source' })).toContainText('update preserved');
  await expect(other.getByRole('textbox', { name: 'JavaScript source' })).toContainText('update preserved');
  await info.attach('update', { body: JSON.stringify({ waitingObserved: true, failedSaveBlockedUpdate: true, clients: 2, physical: false, contentAssessmentChange: 'mock separately; production lifecycle unverified' }), contentType: 'application/json' });
});
