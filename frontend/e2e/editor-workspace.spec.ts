import { expect, test } from '@playwright/test';

test('workspace edits, persists, resets, and reflows without runtime behavior', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/editor-workspace');

  await expect(
    page.getByRole('heading', { name: 'Reusable workspace preview' }),
  ).toBeVisible();
  await expect(page.getByRole('tab', { name: 'main.js' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByText('Execution is unavailable')).toBeVisible();
  await expect(page.getByText(/Checks are unavailable/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Run|Check|Submit/ }),
  ).toHaveCount(0);

  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText("const persisted = 'local';");
  await expect(page.getByText('Unsaved local changes')).toBeVisible();
  await expect(page.getByText('Saved on this device')).toBeVisible();

  const helperTab = page.getByRole('tab', { name: 'helpers.js' });
  await helperTab.click();
  await expect(
    page.getByRole('textbox', { name: 'helpers.js code editor (javascript)' }),
  ).toContainText('normalizeSignal');
  await helperTab.press('Home');
  await expect(page.getByRole('tab', { name: 'main.js' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(editor).toContainText('persisted');

  await page.reload();
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
  ).toContainText('persisted');

  const resetButton = page.getByRole('button', { name: /Reset file/ }).first();
  await resetButton.click();
  const dialog = page.getByRole('dialog', { name: 'Reset main.js?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep edits' }).click();
  await expect(editor).toContainText('persisted');
  await resetButton.click();
  await dialog.getByRole('button', { name: 'Reset file' }).click();
  await expect(editor).toContainText('Map the signal');
  await expect(page.getByText('Saved on this device')).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(
    page.getByRole('button', { name: /Save locally/ }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
