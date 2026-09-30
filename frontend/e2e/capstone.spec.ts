import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import solutions from './fixtures/capstone-solutions.json';

const apiOrigin = 'http://127.0.0.1:3001';

async function session(context: BrowserContext): Promise<void> {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const userId = '00000000-0000-4000-8000-000000000030';
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: expires }),
  ).toString('base64url');
  const auth = {
    access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.local-fixture`,
    refresh_token: 'local-fixture',
    expires_at: expires,
    expires_in: 3600,
    token_type: 'bearer',
    user: { id: userId, email: 'capstone@example.test' },
  };
  await context.addCookies([
    {
      name: 'sb-auth-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(auth)).toString('base64url')}`,
      url: 'http://127.0.0.1:3200',
    },
  ]);
}

async function edit(page: Page, source: string): Promise<void> {
  await page
    .getByRole('heading', { name: 'Editor Workspace' })
    .scrollIntoViewIfNeeded();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(source);
}

async function check(page: Page, passed: boolean): Promise<void> {
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(
    page.getByText(passed ? /Local check passed/ : /Local check failed/),
  ).toBeVisible({ timeout: 15_000 });
}

test('CAP01 publishes separately, checks alternatives and recovers after timeout', async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(100_000);
  await session(context);
  const catalog = await request.get(`${apiOrigin}/api/v1/journeys`);
  expect(await catalog.json()).toEqual([
    expect.objectContaining({ chapterCount: 7, questCount: 25 }),
  ]);
  const response = await request.get(
    `${apiOrigin}/api/v1/quests/inventory-manager`,
  );
  expect(response.status()).toBe(200);
  const quest = await response.json();
  expect(quest).toMatchObject({
    id: 'CAP01',
    kind: 'capstone',
    guestEligible: false,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    prerequisites: [expect.objectContaining({ id: 'Q24' })],
  });
  expect(quest.cases).toHaveLength(10);
  for (const privateField of [
    'reference',
    'alternative',
    'defective',
    'snapshots',
    'transitions',
  ])
    expect(quest).not.toHaveProperty(privateField);
  await page.goto('/quests/inventory-manager');
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible();
  await edit(page, solutions.reference);
  await check(page, true);
  await edit(page, solutions.alternative);
  await check(page, true);
  await edit(page, solutions.defective);
  await check(page, false);
  await edit(page, 'while (true) {}');
  await check(page, false);
  await expect(page.getByText(/timeout/i).last()).toBeVisible();
  await edit(page, solutions.reference);
  await check(page, true);
});

test('CAP01 keeps written work on device and captures explicit offline Submit', async ({
  page,
  context,
}) => {
  test.setTimeout(75_000);
  await session(context);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
    }),
  );
  const protectedWrites: string[] = [];
  await page.route(`${apiOrigin}/api/v1/**`, (route) => {
    if (route.request().method() !== 'GET') {
      protectedWrites.push(route.request().url());
      return route.abort();
    }
    return route.continue();
  });
  await page.goto('/quests/inventory-manager');
  await edit(page, solutions.reference);
  await page
    .getByRole('textbox', { name: 'Debug explanation' })
    .fill(
      'Empty records reveal first-item access. I return zero and keep each helper separate.',
    );
  await page
    .getByRole('textbox', { name: 'Transfer response' })
    .fill(
      'Two different names at quantity 2 both appear for threshold 2; equality is included.',
    );
  await page.getByRole('button', { name: /Save locally/ }).click();
  await expect(page.getByText('Saved on this device')).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('textbox', { name: 'Debug explanation' }),
  ).toHaveValue(/Empty records reveal/);
  await expect(
    page.getByRole('textbox', { name: 'Transfer response' }),
  ).toHaveValue(/equality is included/);
  await page
    .getByRole('heading', { name: 'Editor Workspace' })
    .scrollIntoViewIfNeeded();
  expect(
    (
      await page
        .getByRole('textbox', { name: 'main.js code editor (javascript)' })
        .locator('.cm-line')
        .allTextContents()
    ).join('\n'),
  ).toBe(solutions.reference);
  await check(page, true);
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(page.getByText(/Submission saved on this device/)).toBeVisible();
  expect(protectedWrites).toEqual([]);
  const saved = await page.evaluate(
    () =>
      new Promise<unknown[]>((resolve, reject) => {
        const open = indexedDB.open('codequest');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const database = open.result;
          const request = database
            .transaction('outbox', 'readonly')
            .objectStore('outbox')
            .getAll();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            resolve(request.result.map((row: unknown) => row));
            database.close();
          };
        };
      }),
  );
  expect(JSON.stringify(saved)).toContain(
    'Empty records reveal first-item access',
  );
  expect(JSON.stringify(saved)).toContain('equality is included');
  await page.setViewportSize({ width: 390, height: 780 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test('guest sees the capstone lesson but cannot enter an account workspace', async ({
  page,
}) => {
  await page.goto('/quests/inventory-manager');
  await expect(page.getByText(/Sign in/).last()).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toHaveCount(0);
});
