import { expect, test, type Page } from '@playwright/test';

const journey = {
  id: 'JAVASCRIPT-FOUNDATIONS',
  slug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  position: 1,
  chapterCount: 0,
  questCount: 0,
};

async function mockPublishedJourney(page: Page): Promise<void> {
  await page.route('http://127.0.0.1:3001/api/v1/journeys', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: [journey],
    }),
  );
  await page.route(
    'http://127.0.0.1:3001/api/v1/journeys/javascript-foundations',
    (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: {
          ...journey,
          entryRequirements: [],
          outcomes: [],
          chapters: [],
          courses: [],
        },
      }),
  );
}

test('home leads to a published Journey, onboarding, and safe account entry', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await mockPublishedJourney(page);
  expect(
    (await page.request.get('/journeys/javascript-foundations')).ok(),
  ).toBe(true);
  expect((await page.request.get('/onboarding')).ok()).toBe(true);
  expect((await page.request.get('/login')).ok()).toBe(true);
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('heading', {
      name: 'Make code work.',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /JavaScript Foundations/ }),
  ).toBeVisible({ timeout: 30_000 });
  await page.screenshot({
    path: 'test-results/r03-home-desktop.png',
    fullPage: true,
  });
  await expect
    .poll(() =>
      page
        .locator('img[src*="signal-road"]')
        .evaluate(
          (image: HTMLImageElement) => image.complete && image.naturalWidth > 0,
        ),
    )
    .toBe(true);

  await page.getByRole('link', { name: /JavaScript Foundations/ }).click();
  await expect(page).toHaveURL(/\/journeys\/javascript-foundations$/, {
    timeout: 30_000,
  });
  await expect(
    page.getByRole('heading', { name: 'JavaScript Foundations' }),
  ).toBeVisible({ timeout: 30_000 });
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'How it works' })
    .click();
  await expect(page).toHaveURL(/\/onboarding$/, { timeout: 30_000 });
  await expect(
    page.getByRole('heading', { name: 'Start with a small win.' }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Account' })
    .click();
  await expect(page).toHaveURL(/\/login\?next=%2Faccount/, {
    timeout: 30_000,
  });
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

for (const width of [1280, 820, 390, 320]) {
  test(`home navigation and reflow remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await mockPublishedJourney(page);
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: 'Make code work.',
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /JavaScript Foundations/ }),
    ).toBeVisible();
    if (width === 390) {
      await page.screenshot({
        path: 'test-results/r03-home-mobile.png',
        fullPage: true,
      });
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    if (width <= 760) {
      const menu = page.getByRole('button', { name: 'Open menu' });
      await menu.click();
      await expect(
        page.getByRole('navigation', { name: 'Mobile navigation' }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(menu).toBeFocused();
    } else {
      await expect(
        page.getByRole('navigation', { name: 'Main navigation' }),
      ).toBeVisible();
    }
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('link', { name: 'Skip to main content' }),
    ).toHaveAttribute('href', '#main-content');
  });
}
