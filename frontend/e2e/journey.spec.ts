import { expect, test, type Page, type Route } from '@playwright/test';

const journeySummary = {
  id: 'JAVASCRIPT-FOUNDATIONS',
  slug: 'javascript-foundations',
  title: 'JavaScript Foundations',
  position: 1,
  chapterCount: 2,
  questCount: 4,
};

const chapterSummaries = {
  values: {
    id: 'CH01',
    slug: 'values-and-state',
    title: 'Values and state',
    position: 1,
    objectiveSummary: 'Choose values and update state.',
    questCount: 2,
  },
  flow: {
    id: 'CH02',
    slug: 'control-flow',
    title: 'Control flow',
    position: 2,
    objectiveSummary: 'Make decisions and repeat work.',
    questCount: 2,
  },
};

const questSummaries = {
  first: {
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
  },
  state: {
    id: 'Q02',
    slug: 'change-state',
    title: 'Change state',
    position: 2,
    kind: 'instructional',
    guestEligible: true,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    difficulty: 'introductory',
    xpAward: 10,
  },
  choose: {
    id: 'Q03',
    slug: 'choose-a-path',
    title: 'Choose a path',
    position: 1,
    kind: 'instructional',
    guestEligible: true,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    difficulty: 'developing',
    xpAward: 15,
  },
  repeat: {
    id: 'Q04',
    slug: 'repeat-work',
    title: 'Repeat work',
    position: 2,
    kind: 'instructional',
    guestEligible: true,
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    difficulty: 'developing',
    xpAward: 15,
  },
};

const journey = {
  ...journeySummary,
  entryRequirements: ['Read English and navigate a browser.'],
  outcomes: [{ id: 'O1', description: 'Choose and predict values.' }],
  chapters: [chapterSummaries.flow, chapterSummaries.values],
};

const chapters = {
  [chapterSummaries.values.slug]: {
    ...chapterSummaries.values,
    journey: journeySummary,
    quests: [questSummaries.state, questSummaries.first],
  },
  [chapterSummaries.flow.slug]: {
    ...chapterSummaries.flow,
    journey: journeySummary,
    quests: [questSummaries.repeat, questSummaries.choose],
  },
};

function quest(
  summary: (typeof questSummaries)[keyof typeof questSummaries],
  chapter: (typeof chapterSummaries)[keyof typeof chapterSummaries],
  prerequisites: Array<{ id: string; slug: string; title: string }>,
) {
  return {
    ...summary,
    hierarchy: { journey: journeySummary, chapter },
    objective: `Complete ${summary.title}.`,
    outcomeId: 'O1',
    concepts: [{ id: 'js-values', title: 'JavaScript values' }],
    prerequisites,
    hints: {
      question: 'What happens next?',
      concept: 'Trace the value.',
      nextStep: 'Try one change.',
    },
    lesson: `# ${summary.title}`,
    starterCode: 'const value = 1;',
    cases: [
      {
        id: `${summary.id.toLowerCase()}-normal`,
        category: 'normal',
        kind: 'console',
        feedback: 'Match the output.',
        expectedOutput: '1',
      },
    ],
  };
}

const quests = {
  [questSummaries.first.slug]: quest(
    questSummaries.first,
    chapterSummaries.values,
    [],
  ),
  [questSummaries.state.slug]: quest(
    questSummaries.state,
    chapterSummaries.values,
    [{ id: 'Q01', slug: 'first-value', title: 'First value' }],
  ),
  [questSummaries.choose.slug]: quest(
    questSummaries.choose,
    chapterSummaries.flow,
    [{ id: 'Q02', slug: 'change-state', title: 'Change state' }],
  ),
  [questSummaries.repeat.slug]: quest(
    questSummaries.repeat,
    chapterSummaries.flow,
    [],
  ),
};

async function fulfillJson(route: Route, json: unknown, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', json });
}

async function installCurriculumRoutes(page: Page) {
  await page.route('http://127.0.0.1:3001/api/v1/**', async (route) => {
    expect(route.request().headers().authorization).toBeUndefined();
    const url = new URL(route.request().url());
    const segments = url.pathname.split('/').filter(Boolean);
    const resource = segments.at(-2);
    const slug = decodeURIComponent(segments.at(-1) ?? '');
    if (resource === 'journeys') return fulfillJson(route, journey);
    if (resource === 'chapters' && slug in chapters) {
      return fulfillJson(route, chapters[slug as keyof typeof chapters]);
    }
    if (resource === 'quests' && slug in quests) {
      return fulfillJson(route, quests[slug as keyof typeof quests]);
    }
    return fulfillJson(
      route,
      {
        error: {
          code: 'CURRICULUM_NOT_FOUND',
          message: 'Not found',
          status: 404,
          requestId: 'e2e-not-found',
        },
      },
      404,
    );
  });
}

test('Journey page renders the ordered accessible Course map at desktop and mobile widths', async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await installCurriculumRoutes(page);
  await page.goto('/journeys/javascript-foundations');

  await expect(
    page.getByRole('heading', { level: 1, name: 'JavaScript Foundations' }),
  ).toBeVisible();
  await expect(page.getByText('Overall journey progress: 0 / 4')).toBeVisible();
  await expect(page.getByText('Current quest', { exact: true })).toBeVisible();
  await expect(page.getByText('Available', { exact: true })).toBeVisible();
  await expect(page.getByText('Locked', { exact: true }).first()).toBeVisible();
  await expect(page.locator('section[aria-label^="Chapter"] h3')).toHaveText([
    'Chapter 1: Values and state',
    'Chapter 2: Control flow',
  ]);
  await expect(page.locator('section[aria-label^="Chapter"] ol')).toHaveCount(
    2,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.getByRole('link', { name: 'CodeQuest home' }).focus();
  await expect(
    page.getByRole('link', { name: 'CodeQuest home' }),
  ).toBeFocused();
  expect(
    await page
      .getByRole('link', { name: 'CodeQuest home' })
      .evaluate((element) => getComputedStyle(element).outlineWidth),
  ).toBe('2px');
  await page.keyboard.press('Tab');
  const firstChapterButton = page
    .getByRole('button', { name: 'Open chapter' })
    .first();
  await expect(firstChapterButton).toBeFocused();
  expect(
    (await firstChapterButton.boundingBox())?.height,
  ).toBeGreaterThanOrEqual(44);
  const reducedTransition = await page
    .getByRole('progressbar', { name: 'Overall journey progress' })
    .locator('div')
    .evaluate((element) =>
      Number.parseFloat(getComputedStyle(element).transitionDuration),
    );
  expect(reducedTransition).toBeLessThanOrEqual(0.00001);

  const worldImage = page.locator('img[src*="foundations-valley"]').first();
  await expect(worldImage).toBeVisible();
  expect(
    await worldImage.evaluate(
      (image) => image instanceof HTMLImageElement && image.naturalWidth > 0,
    ),
  ).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Course map' })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const currentQuest = page.getByRole('link', {
    name: 'First value, Current quest',
  });
  await expect(currentQuest).toHaveAttribute('href', '/quests/first-value');
  await Promise.all([
    page.waitForURL('**/quests/first-value'),
    currentQuest.click(),
  ]);
  await expect(
    page.getByRole('heading', { level: 1, name: 'First value' }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('recoverable curriculum failure offers a safe retry', async ({ page }) => {
  let journeyRequests = 0;
  await page.route('http://127.0.0.1:3001/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const segments = url.pathname.split('/').filter(Boolean);
    const resource = segments.at(-2);
    const slug = decodeURIComponent(segments.at(-1) ?? '');
    if (resource === 'journeys') {
      journeyRequests += 1;
      if (journeyRequests === 1) {
        return fulfillJson(
          route,
          {
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Unavailable',
              status: 503,
              requestId: 'retry-request',
            },
          },
          503,
        );
      }
      return fulfillJson(route, journey);
    }
    if (resource === 'chapters' && slug in chapters) {
      return fulfillJson(route, chapters[slug as keyof typeof chapters]);
    }
    return fulfillJson(route, quests[slug as keyof typeof quests]);
  });

  await page.goto('/journeys/javascript-foundations');
  await expect(
    page.getByRole('heading', { name: 'Journey unavailable' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Retry Journey' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'JavaScript Foundations' }),
  ).toBeVisible();
  expect(journeyRequests).toBe(2);
  await expect(page.locator('body')).not.toContainText('retry-request');
});
