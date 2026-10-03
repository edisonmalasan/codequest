import { expect, test, type Page } from '@playwright/test';
import { join } from 'node:path';

const journeySummary = {
  id: 'JAVASCRIPT-FOUNDATIONS',
  slug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  position: 1,
  chapterCount: 1,
  questCount: 1,
};
const chapterSummary = {
  id: 'CH01',
  slug: 'values-and-state',
  title: 'Values and state',
  position: 1,
  objectiveSummary: 'Choose a value.',
  questCount: 1,
};
const questSummary = {
  id: 'Q01',
  slug: 'first-value',
  title: 'First value',
  position: 1,
  kind: 'instructional',
  guestEligible: true,
  contentVersion: '1.0.0',
  assessmentVersion: '1.0.0',
  difficulty: 'introductory',
  xpAward: 10,
};
const quest = {
  ...questSummary,
  hierarchy: { journey: journeySummary, chapter: chapterSummary },
  objective: 'Print one value.',
  outcomeId: 'O1',
  concepts: [{ id: 'js-values', title: 'JavaScript values' }],
  prerequisites: [],
  hints: {
    question: 'What should print?',
    concept: 'A value is data.',
    nextStep: 'Try one change.',
  },
  lesson: '# Mission briefing\n\nRead the value, then run the code.',
  starterCode: "console.log('old');",
  cases: [
    {
      id: 'q01-normal',
      category: 'normal',
      kind: 'console',
      feedback: 'Match the output.',
      expectedOutput: 'new',
    },
  ],
};

async function installCurriculum(page: Page): Promise<void> {
  await page.route('http://127.0.0.1:3001/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const json =
      path === '/api/v1/journeys/javascript-foundations'
        ? {
            ...journeySummary,
            entryRequirements: ['Read English and navigate a browser.'],
            outcomes: [{ id: 'O1', description: 'Choose a value.' }],
            chapters: [chapterSummary],
          }
        : path === '/api/v1/catalog/courses/javascript-foundations'
          ? {
              id: 'COURSE-JS-FOUNDATIONS',
              slug: 'javascript-foundations',
              journeyId: journeySummary.id,
              journeySlug: journeySummary.slug,
              title: journeySummary.title,
              summary: 'Learn JavaScript through exercises.',
              position: 1,
              topics: ['javascript'],
              chapterCount: 1,
              questCount: 1,
              outcomes: [{ id: 'C1', description: 'Choose a value.' }],
              chapters: [chapterSummary],
            }
          : path === '/api/v1/chapters/values-and-state'
            ? {
                ...chapterSummary,
                journey: journeySummary,
                quests: [questSummary],
              }
            : path === '/api/v1/quests/first-value'
              ? quest
              : null;
    await route.fulfill({
      status: json ? 200 : 404,
      contentType: 'application/json',
      json: json ?? { error: { code: 'NOT_FOUND', message: 'Not found' } },
    });
  });
}

function luminance(hex: string): number {
  const channels = hex
    .replace('#', '')
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);
  if (!channels || channels.length !== 3)
    throw new Error(`Invalid contrast color: ${hex}`);
  const linear = channels.map((value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
  );
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(foreground: string, background: string): number {
  const bright = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (bright + 0.05) / (dark + 0.05);
}

async function expectNoPageOverflow(page: Page, route: string): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth), {
      message: `${route} overflows at ${page.viewportSize()?.width}px`,
    })
    .toBeLessThanOrEqual(page.viewportSize()?.width ?? 0);
}

test('home and authentication have a named keyboard path with visible focus', async ({
  page,
  browserName,
  context,
}) => {
  await page.goto('/');
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Write code. Open worlds.',
  );
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  if (browserName === 'webkit') {
    await skipLink.focus();
  } else {
    await page.keyboard.press('Tab');
  }
  await expect(skipLink).toBeFocused();
  const learningLink = page.getByRole('link', { name: /Start learning/ });
  await learningLink.focus();
  await expect(learningLink).toBeFocused();
  const homeOutline = await learningLink.evaluate(
    (element) => getComputedStyle(element).outlineWidth,
  );
  expect(homeOutline, 'home learning link focus ring').toBe('2px');
  await page.setViewportSize({ width: 320, height: 900 });
  await expectNoPageOverflow(page, '/');

  for (const route of ['/login', '/register']) {
    const authPage = await context.newPage();
    await authPage.goto(route);
    await expect(authPage.getByRole('main')).toHaveCount(1);
    await expect(authPage.getByRole('heading', { level: 1 })).toBeVisible();
    expect(
      (
        await authPage
          .getByRole('link', { name: 'CodeQuest home' })
          .boundingBox()
      )?.height,
      `${route} home target height`,
    ).toBeGreaterThanOrEqual(44);
    const email = authPage.getByRole('textbox', { name: 'Email' });
    await email.focus();
    await expect(email).toBeFocused();
    expect(
      await email.evaluate((element) => getComputedStyle(element).outlineWidth),
      `${route} Email focus ring`,
    ).toBe('2px');
    await authPage.keyboard.press('Tab');
    await expect(authPage.getByLabel('Password')).toBeFocused();
    for (const width of [390, 320]) {
      await authPage.setViewportSize({ width, height: 900 });
      await expectNoPageOverflow(authPage, route);
    }
    await authPage.close();
  }
});

test('Journey, lesson, and editor preserve semantic and keyboard access', async ({
  page,
}) => {
  await installCurriculum(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/courses/javascript-foundations');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'JavaScript Foundations',
  );
  expect(
    (await page.getByRole('link', { name: 'CodeQuest home' }).boundingBox())
      ?.height,
    'Course home target height',
  ).toBeGreaterThanOrEqual(44);
  await expect(
    page.getByRole('region', { name: 'Chapters and exercises' }),
  ).toBeVisible();
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoPageOverflow(page, '/courses/javascript-foundations');
  }
  const questLink = page.getByRole('link', {
    name: /First value, Guest practice/,
  });
  await expect(questLink).toBeVisible();
  await questLink.focus();
  await expect(questLink).toBeFocused();
  await questLink.press('Enter');
  await page.waitForURL(/\/quests\/first-value$/, { timeout: 30_000 });
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  expect(
    (await page.getByRole('link', { name: 'CodeQuest home' }).boundingBox())
      ?.height,
    'lesson home target height',
  ).toBeGreaterThanOrEqual(44);
  const hint = page.locator('summary').filter({ hasText: '1. Question hint' });
  await hint.focus();
  await expect(hint).toBeFocused();
  expect(
    await hint.evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).outlineWidth),
    ),
    'lesson hint focus ring',
  ).toBeGreaterThanOrEqual(2);
  await page.keyboard.press('Enter');
  await expect(hint.locator('..')).toHaveAttribute('open', '');

  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Editor Workspace' }),
  ).toBeVisible();

  await page
    .getByRole('heading', { name: 'Editor Workspace', level: 2 })
    .scrollIntoViewIfNeeded();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await expect(editor).toBeVisible();
  await editor.focus();
  const source = await editor.textContent();
  await page.keyboard.press('Control+m');
  await page.keyboard.press('Tab');
  await expect(editor).not.toBeFocused();
  await expect(editor).toHaveText(source ?? '');
  await expect(page.getByText(/Tab move focus/)).toBeVisible();

  await editor.focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText("console.log('keep this draft');");
  const reset = page.getByRole('button', { name: 'Reset file' });
  await reset.focus();
  await reset.press('Enter');
  await expect(
    page.getByRole('dialog', { name: 'Reset main.js?' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(reset).toBeFocused();
  await expect(editor).toContainText('keep this draft');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.getByRole('button', { name: 'Results', exact: true }).click();
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: /Local check failed.*unverified/ }),
  ).toBeVisible({ timeout: 10_000 });
});

test('learning regions reflow without losing the mounted editor or local result', async ({
  page,
}, testInfo) => {
  await installCurriculum(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/quests/first-value');
  const lesson = page.getByRole('article', { name: 'Lesson region' });
  const code = page.getByRole('tabpanel', { name: 'Code editor' });
  const results = page.getByRole('complementary', { name: 'Results region' });
  await expect(lesson).toBeVisible();
  for (const width of [1440, 1280, 820, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoPageOverflow(page, '/quests/first-value');
    if (width <= 1100) {
      await page.getByRole('button', { name: 'Code', exact: true }).click();
    }
    await expect(code).toBeVisible();
    if (width > 1100) await expect(results).toBeVisible();
    if (width <= 1100) {
      await page.getByRole('button', { name: 'Results', exact: true }).click();
      await expect(results).toBeVisible();
      await expect(code).toBeHidden();
      await page.getByRole('button', { name: 'Code', exact: true }).click();
    }
    if (
      process.env.CODEQUEST_CAPTURE_R06 === '1' &&
      testInfo.project.name === 'chromium' &&
      [1440, 1280, 820, 390].includes(width)
    ) {
      await expect(
        page.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
      ).toBeVisible();
      await page.screenshot({
        path: join('..', 'docs', 'frontend-evidence', `r06-shell-${width}.png`),
      });
    }
  }
  expect(
    await page.getByRole('heading', { name: 'Editor Workspace' }).count(),
  ).toBe(1);
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText("console.log('kept across panels');");
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await page.getByRole('button', { name: 'Results', exact: true }).click();
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: /Local check failed.*unverified/ }),
  ).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Code', exact: true }).click();
  await expect(editor).toContainText('kept across panels');
});

test('contrast, reduced motion, target size, and reflow hold at reviewed widths', async ({
  page,
}) => {
  await installCurriculum(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/quests/first-value');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'First value',
  );

  const tokens = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      [
        'canvas',
        'surface-raised',
        'surface-sunken',
        'ink',
        'muted',
        'discovery',
        'danger',
        'ascent',
        'ascent-ink',
        'reward',
      ].map((name) => [
        name,
        styles.getPropertyValue(`--color-${name}`).trim(),
      ]),
    );
  });
  const textPairs: Array<[string, string]> = [
    ['ink', 'canvas'],
    ['ink', 'surface-raised'],
    ['muted', 'surface-raised'],
    ['muted', 'surface-sunken'],
    ['discovery', 'surface-raised'],
    ['danger', 'surface-raised'],
    ['ascent-ink', 'ascent'],
  ];
  for (const [foreground, background] of textPairs) {
    expect(
      contrast(tokens[foreground], tokens[background]),
      `${foreground} on ${background} contrast`,
    ).toBeGreaterThanOrEqual(4.5);
  }
  expect(
    contrast(tokens.reward, tokens.canvas),
    'focus ring contrast',
  ).toBeGreaterThanOrEqual(3);

  const hint = page.locator('summary').first();
  const duration = await hint.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration),
  );
  expect(duration, 'reduced-motion hint transition').toBeLessThanOrEqual(
    0.00001,
  );

  for (const width of [1280, 640, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await expectNoPageOverflow(page, '/quests/first-value');
    const hintBox = await hint.boundingBox();
    expect(
      hintBox?.height,
      `hint target height at ${width}px`,
    ).toBeGreaterThanOrEqual(44);
    if (width <= 700) {
      await page.getByRole('button', { name: 'Code', exact: true }).click();
    }
    for (const name of ['Check', 'Save locally', 'Reset file']) {
      const box = await page
        .getByRole('button', { name, exact: true })
        .boundingBox();
      expect(
        box?.height,
        `${name} height at ${width}px`,
      ).toBeGreaterThanOrEqual(44);
      expect(box?.width, `${name} width at ${width}px`).toBeGreaterThanOrEqual(
        44,
      );
      expect(box?.x, `${name} left edge at ${width}px`).toBeGreaterThanOrEqual(
        0,
      );
      expect(
        (box?.x ?? 0) + (box?.width ?? 0),
        `${name} right edge at ${width}px`,
      ).toBeLessThanOrEqual(width);
    }
    if (width <= 700) {
      await page.getByRole('button', { name: 'Lesson', exact: true }).click();
    }
  }
});
