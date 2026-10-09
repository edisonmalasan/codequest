import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import solutions from './fixtures/foundations-solutions.json';

const apiOrigin = 'http://127.0.0.1:3001';

async function showPanel(page: Page, panel: 'Lesson' | 'Code' | 'Results') {
  if ((page.viewportSize()?.width ?? 1280) <= 1100)
    await page.getByRole('button', { name: panel, exact: true }).click();
}

async function edit(page: Page, source: string) {
  await showPanel(page, 'Code');
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

async function check(page: Page, passed: boolean) {
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showPanel(page, 'Results');
  await expect(
    page.getByText(passed ? /Local check passed/ : /Local check failed/),
  ).toBeVisible({ timeout: 9_000 });
}

// This local browser session only exposes the existing workspace for Q05+.
// It is not a verified principal and never reaches protected learning routes.
async function workspaceSession(context: BrowserContext) {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const userId = '00000000-0000-4000-8000-000000000029';
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: expires }),
  ).toString('base64url');
  const session = {
    access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.local-fixture`,
    refresh_token: 'local-fixture',
    expires_at: expires,
    expires_in: 3600,
    token_type: 'bearer',
    user: { id: userId, email: 'curriculum@example.test' },
  };
  await context.addCookies([
    {
      name: 'sb-auth-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`,
      url: 'http://127.0.0.1:3200',
    },
  ]);
}

for (const solution of solutions) {
  test(`${solution.id}: published reference and alternative pass; defect fails`, async ({
    page,
    context,
    request,
  }) => {
    test.setTimeout(60_000);
    await workspaceSession(context);
    const submissions: string[] = [];
    await page.route(`${apiOrigin}/api/v1/**`, async (route) => {
      const request = route.request();
      if (request.method() === 'GET') return route.continue();
      if (/attempt|sync|import/.test(request.url()))
        submissions.push(request.url());
      // Deliberately unavailable protected activity; no database write occurs.
      return route.abort();
    });
    const response = await request.get(
      `${apiOrigin}/api/v1/quests/${solution.slug}`,
    );
    expect(response.status()).toBe(200);
    await page.goto(`/quests/${solution.slug}`);
    await showPanel(page, 'Code');
    await expect(
      page.getByRole('region', { name: 'Quest workspace' }),
    ).toBeVisible();
    await edit(page, solution.reference);
    await check(page, true);
    await edit(page, solution.alternative);
    await check(page, true);
    await edit(page, solution.defective);
    await check(page, false);
    await showPanel(page, 'Code');
    const editor = page.getByRole('textbox', {
      name: 'main.js code editor (javascript)',
    });
    expect(
      (await editor.locator('.cm-line').allTextContents()).join('\n'),
    ).toBe(solution.defective);
    expect(submissions).toEqual([]);
  });
}

test('published course and guest Q01-Q04 survive reload without account authority', async ({
  page,
  request,
}) => {
  test.setTimeout(90_000);
  const protectedRequests: string[] = [];
  await page.route(`${apiOrigin}/api/v1/**`, async (route) => {
    if (
      /account|attempt|progress|gamification|learning/.test(
        route.request().url(),
      )
    )
      protectedRequests.push(route.request().url());
    return route.continue();
  });
  const list = await request.get(`${apiOrigin}/api/v1/journeys`);
  expect(await list.json()).toEqual([
    expect.objectContaining({
      id: 'JAVASCRIPT-FOUNDATIONS',
      chapterCount: 7,
      questCount: 25,
    }),
    expect.objectContaining({
      id: 'WEB-FOUNDATIONS',
      chapterCount: 8,
      questCount: 24,
    }),
  ]);
  await page.goto('/journeys/javascript-foundations');
  await expect(
    page.getByRole('heading', { name: 'JavaScript Foundations', exact: true }),
  ).toBeVisible();
  await page.goto('/courses/javascript-foundations');
  await expect(
    page.getByRole('link', {
      name: 'First message, Guest practice · provisional',
    }),
  ).toBeVisible();
  for (const solution of solutions.slice(0, 4)) {
    await page.goto(`/quests/${solution.slug}`);
    await expect(
      page.getByRole('heading', { name: 'Goal', exact: true }),
    ).toBeVisible();
    await showPanel(page, 'Code');
    await edit(page, solution.reference);
    if (solution.id === 'Q01') {
      await page.getByRole('button', { name: 'Run', exact: true }).click();
      await showPanel(page, 'Results');
      await expect(page.getByText('I am ready to code!').last()).toBeVisible();
      await showPanel(page, 'Lesson');
      await page.getByText('1. Question hint').click();
      await expect(page.getByText('2. Concept hint')).toBeVisible();
      await showPanel(page, 'Code');
    }
    await check(page, true);
    await expect(
      page.getByText(/Provisional completion saved on this device/),
    ).toBeVisible();
    await page.reload();
    await showPanel(page, 'Results');
    await expect(
      page.getByText(/Provisional completion saved on this device/),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Submit', exact: true }),
    ).toHaveCount(0);
    if (solution.id === 'Q01') {
      await expect(
        page
          .getByRole('navigation', { name: 'Exercise sequence' })
          .getByRole('link', { name: 'Next: Name the values' }),
      ).toBeVisible();
    }
  }
  await page.setViewportSize({ width: 390, height: 780 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.goto('/quests/resource-cost');
  await expect(page.getByText(/Sign in/).last()).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toHaveCount(0);
  expect(protectedRequests).toEqual([]);
});
