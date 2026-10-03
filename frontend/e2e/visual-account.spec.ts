import { expect, test } from '@playwright/test';

const apiOrigin = 'http://127.0.0.1:3001';

function ownerFromAuthorization(value: string | undefined): string | null {
  if (!value?.startsWith('Bearer ')) return null;
  const payload = value.slice(7).split('.')[1];
  if (!payload) return null;
  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    );
    return decoded !== null &&
      typeof decoded === 'object' &&
      'sub' in decoded &&
      typeof decoded.sub === 'string'
      ? decoded.sub
      : null;
  } catch {
    return null;
  }
}

test('synthetic account shows owned facts and reflows without browser overflow', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.route(`${apiOrigin}/api/v1/**`, async (route) => {
    const owner = ownerFromAuthorization(
      route.request().headers().authorization,
    );
    if (!owner) return route.fulfill({ status: 401, json: {} });
    const path = new URL(route.request().url()).pathname;
    const now = '2026-10-03T00:00:00.000Z';
    if (path === '/api/v1/account')
      return route.fulfill({
        status: 200,
        json: {
          id: owner,
          timezone: 'Asia/Manila',
          createdAt: now,
          updatedAt: now,
        },
      });
    if (path === '/api/v1/xp')
      return route.fulfill({
        status: 200,
        json: {
          totalXp: 235,
          clientReported: true,
          level: 3,
          levelStartXp: 200,
          nextLevelAtXp: 300,
          xpIntoLevel: 35,
          xpToNextLevel: 65,
          curveId: 'provisional-linear-100-v1',
          curveProvisional: true,
        },
      });
    if (path === '/api/v1/streaks')
      return route.fulfill({
        status: 200,
        json: {
          currentStreak: 2,
          longestStreak: 5,
          timezone: 'Asia/Manila',
          latestActivityDate: '2026-10-03',
          clientReported: true,
        },
      });
    return route.fulfill({ status: 404, json: {} });
  });

  await page.goto('/register');
  await page.getByLabel('Email').fill('visual-account@example.test');
  await page.getByLabel('Password').fill('synthetic-password-123');
  const signup = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/auth/v1/signup',
  );
  await page.getByRole('button', { name: 'Create account' }).click();
  await signup;
  await page.waitForTimeout(500);
  await page.goto('/account');
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText('235 total XP')).toBeVisible();
  await expect(page.getByText('Current streak: 2 days')).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Guest learning import' }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Pending account work' }),
  ).toBeVisible();
  await expect(page.getByText('Level 3')).toBeVisible();
  await expect(page.getByText('(provisional)')).toBeVisible();
  await page.screenshot({
    path: 'test-results/visual-refresh-account-1440.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390);
  await page.screenshot({
    path: 'test-results/visual-refresh-account-390.png',
    fullPage: true,
  });
});
