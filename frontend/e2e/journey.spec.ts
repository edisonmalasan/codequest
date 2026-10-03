import { expect, test, type Page, type Route } from '@playwright/test';

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
const course = {
  id: 'COURSE-JS-FOUNDATIONS',
  slug: 'javascript-foundations',
  journeyId: journeySummary.id,
  journeySlug: journeySummary.slug,
  title: 'JavaScript Foundations',
  summary: 'Learn JavaScript through exercises.',
  position: 1,
  topics: ['javascript'],
  chapterCount: 1,
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

async function fulfill(route: Route, json: unknown, status = 200) {
  await route.fulfill({ status, contentType: 'application/json', json });
}

async function installCurriculum(page: Page) {
  await page.route('http://127.0.0.1:3001/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/catalog/courses') return fulfill(route, [course]);
    if (path === '/api/v1/catalog/courses/javascript-foundations')
      return fulfill(route, {
        ...course,
        outcomes: [{ id: 'C1', description: 'Use values.' }],
        chapters: [chapterSummary],
      });
    if (path === '/api/v1/journeys/javascript-foundations')
      return fulfill(route, {
        ...journeySummary,
        entryRequirements: ['Read English.'],
        outcomes: [{ id: 'O1', description: 'Choose a value.' }],
        courses: [course],
        chapters: [chapterSummary],
      });
    if (path === '/api/v1/chapters/values-and-state')
      return fulfill(route, {
        ...chapterSummary,
        journey: journeySummary,
        quests: [questSummary],
      });
    if (path === '/api/v1/quests/first-value')
      return fulfill(route, {
        ...questSummary,
        hierarchy: { journey: journeySummary, chapter: chapterSummary },
        objective: 'Print a value.',
        outcomeId: 'O1',
        concepts: [{ id: 'js-values', title: 'JavaScript values' }],
        prerequisites: [],
        hints: {
          question: 'What prints?',
          concept: 'A value is data.',
          nextStep: 'Try one change.',
        },
        lesson: '# First value',
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
      });
    return fulfill(
      route,
      {
        error: {
          code: 'NOT_FOUND',
          message: 'Not found',
          status: 404,
          requestId: 'synthetic',
        },
      },
      404,
    );
  });
}

test('Home, catalog, Journey, Course, and Exercise remain connected at desktop and mobile widths', async ({
  page,
}) => {
  await installCurriculum(page);
  await page.goto('/');
  await page.getByRole('link', { name: /Explore courses/ }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(
    page.getByRole('heading', { name: 'Find what you will build next.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: /JavaScript Foundations/ }).click();
  await expect(page).toHaveURL(/\/courses\/javascript-foundations$/);
  await expect(page.getByText(/Guest work is provisional/)).toBeVisible();
  await page.getByRole('link', { name: 'Journey', exact: true }).click();
  await expect(page).toHaveURL(/\/journeys\/javascript-foundations$/);
  await expect(
    page.getByRole('heading', { name: 'Your route through this Journey' }),
  ).toBeVisible();
  await page
    .getByRole('link', { name: /JavaScript Foundations/ })
    .last()
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByRole('link', { name: /First value, Guest practice/ }).click();
  await page.waitForURL(/\/quests\/first-value$/, { timeout: 30_000 });
  await expect(
    page.getByRole('heading', { level: 1, name: 'First value' }),
  ).toBeVisible();
});

test('Course catalog excludes unpublished courses and recovers from an API error', async ({
  page,
}) => {
  let requests = 0;
  await page.route(
    'http://127.0.0.1:3001/api/v1/catalog/courses',
    async (route) => {
      requests += 1;
      if (requests === 1)
        return fulfill(
          route,
          {
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Unavailable',
              status: 503,
              requestId: 'synthetic',
            },
          },
          503,
        );
      return fulfill(route, [course]);
    },
  );
  await page.goto('/courses');
  await expect(
    page.getByText('Courses are unavailable right now.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Retry loading' }).click();
  await expect(
    page.getByRole('link', { name: /JavaScript Foundations/ }),
  ).toBeVisible();
  await page
    .getByRole('searchbox', { name: 'Search courses' })
    .fill('unpublished');
  await expect(page.getByText('No courses match your search.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(
    page.getByRole('link', { name: /JavaScript Foundations/ }),
  ).toBeVisible();
});
