import { expect, test } from '@playwright/test';
import { runtimeOrigin } from './test-origins';

async function edit(page: import('@playwright/test').Page, source: string) {
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(source);
}

test('local checks cover all modes and hostile recovery without learning authority', async ({
  page,
}) => {
  const forbiddenRequests: string[] = [];
  await page.route('https://example.invalid/**', (route) => {
    forbiddenRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto('/editor-workspace');
  const check = page.getByRole('button', { name: 'Check', exact: true });
  await expect(check).toBeVisible();

  const worker = await page.request.get(
    `${runtimeOrigin}/runtime/validation-worker.js`,
  );
  expect(worker.headers()['content-security-policy']).toContain(
    "worker-src 'none'",
  );
  expect(worker.headers()['content-security-policy']).toContain(
    "connect-src 'none'",
  );
  const bootstrap = await page.request.get(
    `${runtimeOrigin}/runtime/validation-bootstrap.html`,
  );
  expect(bootstrap.headers()['content-security-policy']).toContain(
    "worker-src 'self'",
  );
  const authRoute = await page.request.get(`${runtimeOrigin}/account`);
  expect(authRoute.status()).toBe(404);

  await check.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();
  await expect(page.getByText('printed-message')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Submit' })).toHaveCount(0);

  await edit(page, "console.log('wrong');");
  await expect(page.getByText(/Local check passed — unverified/)).toHaveCount(
    0,
  );
  await check.click();
  await expect(page.getByText(/Local check failed — unverified/)).toBeVisible();
  await expect(page.getByText('Print the target line exactly.')).toBeVisible();

  await page.getByLabel('Local check example').selectOption('value-test');
  await check.click();
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();

  await page.getByLabel('Local check example').selectOption('function-test');
  await check.click();
  await expect(page.getByText('normal-input')).toBeVisible();
  await expect(page.getByText('boundary-zero')).toBeVisible();
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();
  await edit(
    page,
    `globalThis.caseCounter = (globalThis.caseCounter ?? 0) + 1;
    function double(value) { return value * 2 + globalThis.caseCounter - 1; }`,
  );
  await check.click();
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();

  await page.getByLabel('Local check example').selectOption('custom-test');
  await check.click();
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Web preview' }).getByRole('status'),
  ).toContainText('Static preview ready');

  await edit(page, 'while (true) {}');
  await check.click();
  await expect(page.getByText(/Local check failed — unverified/)).toBeVisible({
    timeout: 9_000,
  });
  await expect(page.getByText(/timeout/i).first()).toBeVisible();
  await edit(page, 'return 5;');
  const recoveryStart = Date.now();
  await check.click();
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();
  expect(Date.now() - recoveryStart).toBeLessThan(1_000);

  await edit(page, "fetch('https://example.invalid/secret'); return 5;");
  await check.click();
  await expect(page.getByText(/Local check failed — unverified/)).toBeVisible();
  expect(forbiddenRequests).toHaveLength(0);
  await edit(
    page,
    `
    const restricted = ['fetch', 'indexedDB', 'caches', 'BroadcastChannel',
      'Worker', 'SharedWorker', 'importScripts', 'postMessage', 'document', 'window'];
    return restricted.every((name) => typeof globalThis[name] === 'undefined') ? 5 : 0;
  `,
  );
  await check.click();
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();
  await edit(
    page,
    "await import('https://example.invalid/module.js'); return 5;",
  );
  await check.click();
  await expect(page.getByText(/Local check failed — unverified/)).toBeVisible();
  expect(forbiddenRequests).toHaveLength(0);
  await edit(page, 'return document.cookie;');
  await check.click();
  await expect(page.getByText(/Local check failed — unverified/)).toBeVisible();
  await edit(page, 'while (true) {}');
  await check.click();
  await page.getByRole('button', { name: 'Cancel check' }).click();
  await expect(page.getByText('Validation cancelled')).toBeVisible();
  await edit(page, 'return 5;');
  await check.click();
  await expect(page.getByText(/Local check passed — unverified/)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 780 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
