import { expect, test } from '@playwright/test';

test('workspace executes isolated JavaScript, recovers, persists, and reflows', async ({
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
  await expect(page.getByText(/Checks are unavailable/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Check|Submit/ })).toHaveCount(
    0,
  );

  const bootstrapResponse = await page.request.get(
    'http://localhost:3100/runtime/bootstrap.html',
  );
  expect(bootstrapResponse.headers()['content-security-policy']).toContain(
    "worker-src 'self'",
  );
  expect(bootstrapResponse.headers()['content-security-policy']).toContain(
    "connect-src 'none'",
  );
  const workerResponse = await page.request.get(
    'http://localhost:3100/runtime/javascript-worker.js',
  );
  expect(workerResponse.headers()['content-security-policy']).toContain(
    "worker-src 'none'",
  );
  expect(workerResponse.headers()['content-security-policy']).toContain(
    "script-src 'unsafe-eval'",
  );

  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    "console.log('worker-output'); return { answer: 42 };",
  );
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByText('worker-output', { exact: true })).toBeVisible();
  await expect(page.getByText('Return: {answer:42}')).toBeVisible();
  await expect(page.getByText(/Completed in .* seconds/)).toBeVisible();
  await expect(page.getByText('Unsaved local changes')).toBeVisible();
  await expect(page.getByText('Saved on this device')).toBeVisible();

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('const = ;');
  await page.keyboard.press('Control+Enter');
  await expect(page.getByText(/syntax error after/)).toBeVisible();

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText("throw new Error('learner boom')");
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByText('learner boom', { exact: true })).toBeVisible();

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('while (true) {}');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByText(/timeout after/)).toBeVisible({ timeout: 4_000 });
  await expect(editor).toContainText('while (true)');

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    "console.log('fresh-after-timeout'); return 7;",
  );
  const recoveryStart = Date.now();
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(
    page.getByText('fresh-after-timeout', { exact: true }),
  ).toBeVisible();
  expect(Date.now() - recoveryStart).toBeLessThan(1_000);

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    'return new Proxy({}, { ownKeys() { while (true) {} } });',
  );
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByText(/timeout after/)).toBeVisible({ timeout: 4_000 });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText("console.log('fresh-after-proxy'); return 8;");
  const proxyRecoveryStart = Date.now();
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(
    page.getByText('fresh-after-proxy', { exact: true }),
  ).toBeVisible();
  expect(Date.now() - proxyRecoveryStart).toBeLessThan(1_000);

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    "globalThis.__codequestLeak = 'set'; return 'set';",
  );
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByText('Return: set')).toBeVisible();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('return String(globalThis.__codequestLeak);');
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByText('Return: undefined')).toBeVisible();

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText("console.log('x'.repeat(13000));");
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(page.getByText(/output limit after/)).toBeVisible();

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('while (true) {}');
  await page.getByRole('button', { name: 'Run' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Execution cancelled').last()).toBeVisible();

  let forbiddenRequests = 0;
  await page.evaluate(() => {
    localStorage.setItem('codequest-session-probe', 'APP_SESSION_SENTINEL');
    document.cookie =
      'codequest-session-probe=APP_COOKIE_SENTINEL; SameSite=Lax';
  });
  await page.route('**/forbidden-runtime-probe', async (route) => {
    forbiddenRequests += 1;
    await route.fulfill({ status: 204 });
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(`
console.log([
  typeof fetch,
  typeof XMLHttpRequest,
  typeof WebSocket,
  typeof EventSource,
  typeof indexedDB,
  typeof caches,
  typeof localStorage,
  typeof Worker,
  typeof SharedWorker,
  typeof BroadcastChannel,
  typeof document,
  typeof postMessage
].join(','));
try { await import('/forbidden-runtime-probe'); } catch { console.log('import-denied'); }
return 'boundary-ok';`);
  await page.getByRole('button', { name: 'Run' }).click();
  await expect(
    page.getByText(
      'undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined',
    ),
  ).toBeVisible();
  await expect(page.getByText('import-denied', { exact: true })).toBeVisible();
  await expect(page.getByText('Return: boundary-ok')).toBeVisible();
  expect(forbiddenRequests).toBe(0);
  await expect(page.getByText(/APP_(SESSION|COOKIE)_SENTINEL/)).toHaveCount(0);

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
  await expect(editor).toContainText('boundary-ok');

  await page.reload();
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await expect(
    page.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
  ).toContainText('boundary-ok');

  const resetButton = page.getByRole('button', { name: /Reset file/ }).first();
  await resetButton.click();
  const dialog = page.getByRole('dialog', { name: 'Reset main.js?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Keep edits' }).click();
  await expect(editor).toContainText('boundary-ok');
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
  await expect(page.getByRole('button', { name: 'Run' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Check|Submit/ })).toHaveCount(
    0,
  );
  expect(consoleErrors).toEqual([]);
});
