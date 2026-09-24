import { expect, test, type Page, type Route } from '@playwright/test';

const quest = {
  id: 'Q01',
  slug: 'first-message',
  title: 'First message',
  position: 1,
  kind: 'instructional',
  guestEligible: true,
  contentVersion: '1.0.0',
  assessmentVersion: '1.0.0',
  difficulty: 'introductory',
  xpAward: 10,
  hierarchy: {
    journey: {
      id: 'JAVASCRIPT-FOUNDATIONS',
      slug: 'javascript-foundations',
      title: 'JavaScript Foundations',
      position: 1,
      chapterCount: 1,
      questCount: 1,
    },
    chapter: {
      id: 'CH01',
      slug: 'variables',
      title: 'Variables',
      position: 1,
      objectiveSummary: 'Store values.',
      questCount: 1,
    },
  },
  objective: 'Print one exact message.',
  outcomeId: 'O1',
  concepts: [{ id: 'strings', title: 'Strings' }],
  prerequisites: [],
  hints: {
    question: 'What should print?',
    concept: 'A string is text.',
    nextStep: 'Change the quoted value.',
  },
  lesson: `# Mission briefing

Read the **message** and follow these instructions:

1. Compare the required text.
2. Notice every space.

> Output is text, not the source itself.

\`\`\`javascript
console.log('This deliberately long code example stays inside its own horizontally scrollable region without widening the lesson page.');
\`\`\`

![A pixel terminal showing one printed line](./assets/terminal.png)

![Unavailable diagram](./assets/missing.webp)`,
  starterCode: "console.log('old');",
  cases: [
    {
      id: 'normal',
      category: 'normal',
      kind: 'console',
      feedback: 'Match it.',
      expectedOutput: 'new',
    },
  ],
};

const pixel = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

async function installLessonRoutes(page: Page): Promise<void> {
  await page.route('http://127.0.0.1:3001/api/v1/**', async (route: Route) => {
    expect(route.request().headers().authorization).toBeUndefined();
    const url = new URL(route.request().url());
    if (url.pathname === '/api/v1/quests/first-message') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: quest,
      });
    }
    if (
      url.pathname === '/api/v1/quests/first-message/assets/1.0.0' &&
      url.searchParams.get('path') === 'assets/terminal.png'
    ) {
      return route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: pixel,
        headers: { 'x-content-type-options': 'nosniff' },
      });
    }
    if (
      url.pathname === '/api/v1/quests/first-message/assets/1.0.0' &&
      url.searchParams.get('path') === 'assets/missing.webp'
    ) {
      return route.fulfill({
        status: 200,
        contentType: 'image/webp',
        body: 'invalid-image-fixture',
      });
    }
    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      json: {
        error: {
          code: 'NOT_FOUND',
          message: 'Resource not found',
          status: 404,
          requestId: 'asset-missing',
        },
      },
    });
  });
}

test('published lesson is keyboard-readable, responsive, and safely illustrated', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installLessonRoutes(page);
  await page.goto('/quests/first-message');

  await expect(
    page.getByRole('heading', { level: 1, name: 'First message' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Mission briefing' }),
  ).toBeVisible();
  await expect(page.getByRole('list').first()).toContainText(
    'Compare the required text.',
  );
  await expect(
    page.getByRole('complementary', { name: 'Lesson callout' }),
  ).toContainText('Output is text');
  await expect(
    page.getByRole('img', {
      name: 'A pixel terminal showing one printed line',
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Unavailable diagram' }),
  ).toContainText('Illustration unavailable');

  const firstHint = page
    .locator('summary')
    .filter({ hasText: '1. Question hint' });
  await firstHint.focus();
  await page.keyboard.press('Enter');
  await expect(firstHint.locator('..')).toHaveAttribute('open', '');
  await expect(
    page
      .locator('summary')
      .filter({ hasText: '3. Next-step hint' })
      .locator('..'),
  ).not.toHaveAttribute('open', '');

  const codeRegion = page.getByRole('region', { name: 'JavaScript example' });
  await codeRegion.focus();
  await expect(codeRegion).toBeFocused();
  expect(
    await codeRegion.evaluate((node) => node.scrollWidth > node.clientWidth),
  ).toBe(true);
  expect(
    await page
      .getByRole('img', { name: 'A pixel terminal showing one printed line' })
      .evaluate(
        (node) => node instanceof HTMLImageElement && node.naturalWidth > 0,
      ),
  ).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(consoleErrors).toEqual([]);
});
