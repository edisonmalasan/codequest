import { randomUUID } from 'node:crypto';
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import solutions from './fixtures/foundations-solutions.json';

const apiOrigin = 'http://127.0.0.1:3001';
const authOrigin = 'http://127.0.0.1:54321';
const q01 = solutions[0];
const q02 = solutions[1];

test.beforeEach(async ({ page, browserName }) => {
  if (browserName === 'webkit') {
    // Dev-only hot reload is unrelated to learning behavior and crashes WebKit's
    // network process in CI. Keep its socket local to the browser test.
    await page.routeWebSocket('**/_next/webpack-hmr', () => {});
  }
});

async function register(request: APIRequestContext) {
  const email = `learning-${randomUUID()}@example.test`;
  const response = await request.post(`${authOrigin}/auth/v1/signup`, {
    data: { email, password: 'testing-password-123' },
  });
  expect(response.status()).toBe(200);
  const session = await response.json();
  expect(session.user.id).toBeTruthy();
  expect(session.access_token).toBeTruthy();
  return session as { user: { id: string }; access_token: string };
}

function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}

async function edit(page: Page, source: string) {
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

async function showLearningPanel(
  page: Page,
  panel: 'Code' | 'Results',
): Promise<void> {
  if ((page.viewportSize()?.width ?? 1280) <= 1100) {
    await page.getByRole('button', { name: panel, exact: true }).click();
  }
}

interface CssCourseQuest {
  id: string;
  slug: string;
  contentVersion: string;
  assessmentVersion: string;
  cases: Array<{
    id: string;
    kind: 'css-declaration';
    selector: string;
    property: string;
    expectedValue: string;
    media?: { type: 'min-width' | 'max-width'; widthPx: number };
  }>;
  exercise: {
    mode: 'static-web';
    files: Array<{
      id: string;
      language: 'html' | 'css';
      starterSource: string;
    }>;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cssCourseQuest(value: unknown): value is CssCourseQuest {
  if (!isRecord(value)) return false;
  const quest = value;
  if (
    typeof quest.id !== 'string' ||
    typeof quest.slug !== 'string' ||
    typeof quest.contentVersion !== 'string' ||
    typeof quest.assessmentVersion !== 'string' ||
    !Array.isArray(quest.cases) ||
    !isRecord(quest.exercise)
  )
    return false;
  const exercise = quest.exercise;
  return (
    exercise.mode === 'static-web' &&
    Array.isArray(exercise.files) &&
    exercise.files.length === 2 &&
    exercise.files.every(
      (file: unknown) =>
        isRecord(file) &&
        typeof file.id === 'string' &&
        ['html', 'css'].includes(String(file.language)) &&
        typeof file.starterSource === 'string',
    ) &&
    quest.cases.length >= 2 &&
    quest.cases.every(
      (item: unknown) =>
        isRecord(item) &&
        typeof item.id === 'string' &&
        item.kind === 'css-declaration' &&
        typeof item.selector === 'string' &&
        typeof item.property === 'string' &&
        typeof item.expectedValue === 'string' &&
        (item.media === undefined ||
          (isRecord(item.media) &&
            ['min-width', 'max-width'].includes(String(item.media.type)) &&
            Number.isInteger(item.media.widthPx))),
    )
  );
}

function cssCaseSource(quest: CssCourseQuest): string {
  const files = quest.exercise.files.map((file) => ({
    id: file.id,
    language: file.language,
    source:
      file.language === 'css'
        ? `${file.starterSource}\n${quest.cases
            .map((item) => {
              const rule = `${item.selector} { ${item.property}: ${item.expectedValue}; }`;
              return item.media
                ? `@media (${item.media.type}: ${item.media.widthPx}px) { ${rule} }`
                : rule;
            })
            .join('\n')}`
        : file.starterSource,
  }));
  return JSON.stringify({
    schemaVersion: 1,
    questId: quest.id,
    contentVersion: quest.contentVersion,
    assessmentVersion: quest.assessmentVersion,
    mode: 'static-web',
    files,
  });
}

test('accepted Q01 links owner attempt, progress, XP, streak and Q02 unlock exactly once', async ({
  request,
}) => {
  const owner = await register(request);
  const other = await register(request);
  const questResponse = await request.get(
    `${apiOrigin}/api/v1/quests/${q01.slug}`,
  );
  expect(questResponse.status()).toBe(200);
  const quest = await questResponse.json();
  const own = { headers: bearer(owner.access_token) };
  const otherOwner = { headers: bearer(other.access_token) };
  const progressPath = `${apiOrigin}/api/v1/quests/${q02.slug}/progress`;
  const before = await request.get(progressPath, own);
  expect(before.status()).toBe(200);
  expect(await before.json()).toMatchObject({ availability: 'locked' });
  const body = {
    clientEventId: randomUUID(),
    contentVersion: quest.contentVersion,
    assessmentVersion: quest.assessmentVersion,
    source: q01.reference,
    report: {
      checkId: randomUUID(),
      status: 'completed',
      passed: true,
      cases: quest.cases.map((item: { id: string }) => ({
        id: item.id,
        label: item.id,
        status: 'passed',
        message: 'Passed',
      })),
      failedCaseIds: [],
      feedback: 'All passed',
      durationMs: 12,
    },
  };
  const path = `${apiOrigin}/api/v1/quests/${q01.slug}/attempts`;
  const accepted = await request.post(path, { ...own, data: body });
  expect(accepted.status()).toBe(201);
  const result = await accepted.json();
  expect(result).toMatchObject({
    questId: 'Q01',
    accepted: true,
    reportedPassed: true,
    attemptCount: 1,
    clientReported: true,
  });
  const history = await request.get(path, own);
  expect(await history.json()).toMatchObject({
    attemptCount: 1,
    attempts: [
      expect.objectContaining({ id: result.id, source: q01.reference }),
    ],
  });
  const progress = await request.get(
    `${apiOrigin}/api/v1/quests/${q01.slug}/progress`,
    own,
  );
  expect(await progress.json()).toMatchObject({ status: 'completed' });
  const unlocked = await request.get(progressPath, own);
  expect(await unlocked.json()).toMatchObject({ availability: 'available' });
  const xp = await request.get(`${apiOrigin}/api/v1/xp`, own);
  const xpTotal = (await xp.json()).totalXp;
  expect(xpTotal).toBeGreaterThan(0);
  const streak = await request.get(`${apiOrigin}/api/v1/streaks`, own);
  expect(await streak.json()).toMatchObject({
    currentStreak: 1,
    longestStreak: 1,
  });

  const replay = await request.post(path, { ...own, data: body });
  expect(replay.status()).toBe(201);
  expect(await replay.json()).toMatchObject({ id: result.id, attemptCount: 1 });
  expect(
    (await (await request.get(`${apiOrigin}/api/v1/xp`, own)).json()).totalXp,
  ).toBe(xpTotal);
  expect(await (await request.get(path, otherOwner)).json()).toMatchObject({
    attemptCount: 0,
    attempts: [],
  });
  expect(
    await (await request.get(progressPath, otherOwner)).json(),
  ).toMatchObject({
    availability: 'locked',
  });
  expect(
    (await (await request.get(`${apiOrigin}/api/v1/xp`, otherOwner)).json())
      .totalXp,
  ).toBe(0);
});

test('guest runs, Checks, signs up, explicitly imports, and submits the next quest', async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const prematureWrites: string[] = [];
  let submittedAuthorization: string | undefined;
  page.on('request', (request) => {
    if (
      request.url().startsWith(`${apiOrigin}/api/v1/`) &&
      request.method() !== 'GET'
    )
      prematureWrites.push(request.url());
    if (request.url().endsWith('/api/v1/learning-sync/Q02'))
      submittedAuthorization = request.headers().authorization;
  });
  await page.goto(`/quests/${q01.slug}`);
  await showLearningPanel(page, 'Code');
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible();
  await edit(page, q01.reference);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await showLearningPanel(page, 'Results');
  await expect(page.getByText('I am ready to code!').last()).toBeVisible();
  await showLearningPanel(page, 'Code');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showLearningPanel(page, 'Results');
  await expect(page.getByText(/Local check passed/)).toBeVisible();
  await expect(
    page.getByText(/Provisional completion saved on this device/),
  ).toBeVisible();
  expect(prematureWrites).toEqual([]);

  await page.getByRole('link', { name: 'Sign up' }).last().click();
  await expect(
    page.getByRole('button', { name: 'Create account' }),
  ).toBeVisible();
  await page.getByLabel('Email').fill(`journey-${randomUUID()}@example.test`);
  await page.getByLabel('Password').fill('testing-password-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(
    page.getByRole('heading', { name: 'Your account' }),
  ).toBeVisible();
  await expect(page.getByText('Q01: provisional Check saved')).toBeVisible();
  await page
    .getByRole('button', { name: 'Import guest work into this account' })
    .click();
  await expect(
    page.getByText(/accepted/, { exact: false }).last(),
  ).toBeVisible();
  await expect(page.getByText(/[1-9]\d* total XP/)).toBeVisible();
  await expect(page.getByText(/Current streak: 1 days/)).toBeVisible();
  await page.getByText('View and copy saved guest source').click();
  await expect(page.getByText(q01.reference, { exact: true })).toBeVisible();

  await page.goto(`/quests/${q02.slug}`);
  await showLearningPanel(page, 'Code');
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible();
  await edit(page, q02.reference);
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showLearningPanel(page, 'Results');
  await expect(page.getByText(/Local check passed/)).toBeVisible();
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(page.getByText(/Submission delivery confirmed/)).toBeVisible();
  expect(submittedAuthorization).toMatch(/^Bearer /);
  if (!submittedAuthorization)
    throw new Error('Q02 request was not authorized');
  const progress = await request.get(
    `${apiOrigin}/api/v1/quests/${q02.slug}/progress`,
    { headers: { Authorization: submittedAuthorization } },
  );
  expect(progress.status()).toBe(200);
  expect(await progress.json()).toMatchObject({ status: 'completed' });
  const history = await request.get(
    `${apiOrigin}/api/v1/quests/${q02.slug}/attempts`,
    { headers: { Authorization: submittedAuthorization } },
  );
  expect(await history.json()).toMatchObject({
    attemptCount: 1,
    attempts: [
      expect.objectContaining({ accepted: true, source: q02.reference }),
    ],
  });
  await page.goto('/courses/javascript-foundations');
  const completedQuest = page.getByRole('link', {
    name: 'Name the values, Completed',
  });
  await expect(completedQuest).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Update supplies, Available' }),
  ).toBeVisible();
  await expect(completedQuest).toHaveAttribute(
    'href',
    '/quests/name-the-values',
  );
  await page.goto('/quests/name-the-values');
  await expect(page).toHaveURL(/\/quests\/name-the-values$/);
  await showLearningPanel(page, 'Code');
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page
      .getByRole('navigation', { name: 'Exercise sequence' })
      .getByRole('link', { name: 'Next: Update supplies' }),
  ).toBeVisible();
  const revisitedHistory = await request.get(
    `${apiOrigin}/api/v1/quests/${q02.slug}/attempts`,
    { headers: { Authorization: submittedAuthorization } },
  );
  expect(await revisitedHistory.json()).toMatchObject({ attemptCount: 1 });

  await page.goto('/quests/synthetic-static-web');
  await showLearningPanel(page, 'Code');
  await expect(
    page.getByRole('textbox', { name: 'index.html code editor (html)' }),
  ).toBeVisible();
  await expect(page.getByRole('tab', { name: 'style.css' })).toBeVisible();
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showLearningPanel(page, 'Results');
  await expect(page.getByText(/Local check passed.*unverified/)).toBeVisible();
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(page.getByText(/Submission delivery confirmed/)).toBeVisible();
  const webPath = `${apiOrigin}/api/v1/quests/synthetic-static-web`;
  const webHistory = await request.get(`${webPath}/attempts`, {
    headers: { Authorization: submittedAuthorization },
  });
  expect(webHistory.status()).toBe(200);
  const savedWeb = await webHistory.json();
  expect(savedWeb).toMatchObject({
    attemptCount: 1,
    attempts: [expect.objectContaining({ accepted: true, questId: 'WEB01' })],
  });
  const firstWebAttempt = savedWeb.attempts[0];
  expect(JSON.parse(firstWebAttempt.source)).toMatchObject({
    schemaVersion: 1,
    questId: 'WEB01',
    mode: 'static-web',
    files: [
      { id: 'page', source: '<h1 id="answer">Hello</h1>' },
      { id: 'style', source: 'h1 { color: blue; }' },
    ],
  });
  const webReplay = await request.post(
    `${apiOrigin}/api/v1/learning-sync/WEB01`,
    {
      headers: { Authorization: submittedAuthorization },
      data: {
        clientEventId: firstWebAttempt.clientEventId,
        contentVersion: firstWebAttempt.contentVersion,
        assessmentVersion: firstWebAttempt.assessmentVersion,
        source: firstWebAttempt.source,
        report: firstWebAttempt.report,
      },
    },
  );
  expect(webReplay.status()).toBe(201);
  expect(await webReplay.json()).toMatchObject({
    id: firstWebAttempt.id,
    attemptCount: 1,
  });
  const webProgress = await request.get(`${webPath}/progress`, {
    headers: { Authorization: submittedAuthorization },
  });
  expect(await webProgress.json()).toMatchObject({ status: 'completed' });
  await page.goto('/courses/javascript-foundations');
  await expect(
    page.getByRole('link', { name: 'Synthetic web exercise, Completed' }),
  ).toHaveAttribute('href', '/quests/synthetic-static-web');
  await page.goto('/quests/synthetic-static-web');
  await expect(page).toHaveURL(/\/quests\/synthetic-static-web$/);
  await showLearningPanel(page, 'Code');
  await expect(
    page.getByRole('textbox', { name: 'index.html code editor (html)' }),
  ).toBeVisible({ timeout: 30_000 });
  expect(
    await (
      await request.get(`${webPath}/attempts`, {
        headers: { Authorization: submittedAuthorization },
      })
    ).json(),
  ).toMatchObject({ attemptCount: 1 });
  await page.goto('/account');
  await expect(page.getByText('Q01: provisional Check saved')).toBeVisible();
});

test('published HTML Course flows from map through inert Preview, Check, accepted Submit, and Next', async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  let authorization: string | undefined;
  page.on('request', (entry) => {
    if (entry.url().endsWith('/api/v1/learning-sync/HTML01'))
      authorization = entry.headers().authorization;
  });
  await page.goto('/register?next=%2Fcourses');
  await page
    .getByLabel('Email')
    .fill(`html-course-${randomUUID()}@example.test`);
  await page.getByLabel('Password').fill('testing-password-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await page.reload();
  await page.getByRole('searchbox', { name: 'Search courses' }).fill('HTML');
  await expect(page.getByText('1 published course')).toBeVisible();
  const courseLink = page.getByRole('link', { name: /HTML Foundations/ });
  await expect(courseLink).toHaveAttribute('href', '/courses/html-foundations');
  await page.goto('/courses/html-foundations');
  await expect(
    page.getByRole('heading', { name: 'HTML Foundations' }),
  ).toBeVisible();
  await expect(page.getByText('4 chapters · 12 exercises')).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Forms and field guide' }),
  ).toBeVisible();
  const orderedLessons = await page
    .locator('main ol ol > li')
    .allTextContents();
  expect(orderedLessons).toHaveLength(12);
  for (const [index, title] of [
    'First page',
    'Heading map',
    'Readable copy',
    'Useful links',
    'Images with meaning',
    'Clear lists',
    'Page landmarks',
    'Figure and caption',
    'Data table',
    'Labels and fields',
    'Grouped questions',
    'Field guide page',
  ].entries())
    expect(orderedLessons[index]).toContain(title);
  await expect(
    page.getByRole('link', { name: 'First page, Available' }),
  ).toHaveAttribute('href', '/quests/first-page');
  await page.goto('/quests/first-page');
  await expect(page).toHaveURL(/\/quests\/first-page$/);
  await showLearningPanel(page, 'Code');
  const editor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await page
    .getByRole('tabpanel', { name: 'Code editor' })
    .scrollIntoViewIfNeeded();
  await expect(editor).toBeVisible({ timeout: 30_000 });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '<main id="page"><h1 id="title">City field notes</h1><p>Small observations from the streets we share.</p></main>',
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await showLearningPanel(page, 'Results');
  await expect(
    page.getByRole('region', { name: 'Web preview' }).getByRole('status'),
  ).toContainText('Static preview ready');
  await showLearningPanel(page, 'Code');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showLearningPanel(page, 'Results');
  await expect(page.getByText(/Local check passed/)).toBeVisible();
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(page.getByText(/Submission delivery confirmed/)).toBeVisible();
  expect(authorization).toMatch(/^Bearer /);
  if (!authorization) throw new Error('HTML01 request was not authorized');
  const own = { headers: { Authorization: authorization } };
  const firstPath = `${apiOrigin}/api/v1/quests/first-page`;
  expect(
    await (await request.get(`${firstPath}/progress`, own)).json(),
  ).toMatchObject({
    status: 'completed',
  });
  expect(
    await (
      await request.get(`${apiOrigin}/api/v1/quests/heading-map/progress`, own)
    ).json(),
  ).toMatchObject({ availability: 'available' });
  expect(
    await (await request.get(`${apiOrigin}/api/v1/xp`, own)).json(),
  ).toMatchObject({
    totalXp: 10,
  });
  await expect(
    page
      .getByRole('navigation', { name: 'Exercise sequence' })
      .getByRole('link', { name: 'Next: Heading map' }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Exercise sequence' })
    .getByRole('link', { name: 'Next: Heading map' })
    .click();
  await expect(page).toHaveURL(/\/quests\/heading-map$/);
  await expect(
    page.getByRole('heading', { name: 'Heading map' }),
  ).toBeVisible();
  await page.goto('/quests/first-page');
  await page.reload();
  await showLearningPanel(page, 'Code');
  await expect(editor).toContainText('City field notes');
  await page.goto('/courses/html-foundations');
  await expect(
    page.getByRole('link', { name: 'First page, Completed' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Heading map, Available' }),
  ).toBeVisible();
  const saved = await (await request.get(`${firstPath}/attempts`, own)).json();
  expect(saved).toMatchObject({
    attemptCount: 1,
  });
  const firstAttempt = saved.attempts[0];
  const replay = await request.post(
    `${apiOrigin}/api/v1/learning-sync/HTML01`,
    {
      ...own,
      data: {
        clientEventId: firstAttempt.clientEventId,
        contentVersion: firstAttempt.contentVersion,
        assessmentVersion: firstAttempt.assessmentVersion,
        source: firstAttempt.source,
        report: firstAttempt.report,
      },
    },
  );
  expect(replay.status()).toBe(201);
  expect(await replay.json()).toMatchObject({
    id: firstAttempt.id,
    attemptCount: 1,
  });
  expect(
    await (await request.get(`${apiOrigin}/api/v1/xp`, own)).json(),
  ).toMatchObject({ totalXp: 10 });
});

test('published CSS Course reaches the final responsive guide with trusted account recovery', async ({
  page,
  request,
}) => {
  test.setTimeout(240_000);
  let authorization: string | undefined;
  page.on('request', (entry) => {
    if (entry.url().endsWith('/api/v1/learning-sync/CSS01'))
      authorization = entry.headers().authorization;
  });
  await page.goto('/register?next=%2Fcourses');
  await page
    .getByLabel('Email')
    .fill(`css-course-${randomUUID()}@example.test`);
  await page.getByLabel('Password').fill('testing-password-123');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await page.reload();
  await page.getByRole('searchbox', { name: 'Search courses' }).fill('CSS');
  const courseLink = page.getByRole('link', { name: /CSS Foundations/ });
  await expect(courseLink).toHaveAttribute('href', '/courses/css-foundations');
  await page.goto('/courses/css-foundations');
  await expect(
    page.getByRole('heading', { name: 'CSS Foundations' }),
  ).toBeVisible();
  await expect(page.getByText('4 chapters · 12 exercises')).toBeVisible();
  const orderedLessons = await page
    .locator('main ol ol > li')
    .allTextContents();
  expect(orderedLessons).toHaveLength(12);
  expect(orderedLessons[0]).toContain('Style a field note');
  expect(orderedLessons[11]).toContain('Finish the field guide');
  await expect(
    page.getByRole('link', { name: 'Style a field note, Available' }),
  ).toHaveAttribute('href', '/quests/style-a-note');

  await page.goto('/quests/style-a-note');
  await showLearningPanel(page, 'Code');
  await page.getByRole('tab', { name: 'style.css' }).click();
  const firstCss = page.getByRole('textbox', {
    name: 'style.css code editor (css)',
  });
  await expect(firstCss).toBeVisible({ timeout: 30_000 });
  await firstCss.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '.field-note { color: navy; background-color: #f2e9d8; }',
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await showLearningPanel(page, 'Results');
  const preview = page.getByRole('region', { name: 'Web preview' });
  await expect(preview.getByRole('status')).toContainText(
    'Static preview ready',
  );
  await preview.getByRole('button', { name: 'Narrow · 390px' }).click();
  await expect(
    preview.getByRole('button', { name: 'Narrow · 390px' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await showLearningPanel(page, 'Code');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showLearningPanel(page, 'Results');
  await expect(page.getByText(/Local check passed/)).toBeVisible();
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(page.getByText(/Submission delivery confirmed/)).toBeVisible();
  expect(authorization).toMatch(/^Bearer /);
  if (!authorization) throw new Error('CSS01 request was not authorized');
  const own = { headers: { Authorization: authorization } };
  expect(
    await (
      await request.get(`${apiOrigin}/api/v1/quests/style-a-note/progress`, own)
    ).json(),
  ).toMatchObject({ status: 'completed' });
  expect(
    await (
      await request.get(
        `${apiOrigin}/api/v1/quests/choose-the-heading/progress`,
        own,
      )
    ).json(),
  ).toMatchObject({ availability: 'available' });
  await expect(
    page
      .getByRole('navigation', { name: 'Exercise sequence' })
      .getByRole('link', { name: 'Next: Choose the heading' }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Exercise sequence' })
    .getByRole('link', { name: 'Next: Choose the heading' })
    .click();
  await expect(page).toHaveURL(/\/quests\/choose-the-heading$/);

  for (const slug of [
    'choose-the-heading',
    'resolve-a-rule',
    'set-reading-type',
    'mark-an-observation',
    'give-text-room',
    'frame-a-card',
    'align-a-toolbar',
    'build-a-grid',
    'stack-at-narrow-width',
    'open-a-wide-layout',
  ]) {
    const detailResponse = await request.get(
      `${apiOrigin}/api/v1/quests/${slug}`,
    );
    expect(detailResponse.status()).toBe(200);
    const detail: unknown = await detailResponse.json();
    if (!cssCourseQuest(detail))
      throw new Error(`Invalid static CSS Quest payload for ${slug}`);
    const result = await request.post(
      `${apiOrigin}/api/v1/quests/${slug}/attempts`,
      {
        ...own,
        data: {
          clientEventId: randomUUID(),
          contentVersion: detail.contentVersion,
          assessmentVersion: detail.assessmentVersion,
          source: cssCaseSource(detail),
          report: {
            checkId: randomUUID(),
            status: 'completed',
            passed: true,
            cases: detail.cases.map((item) => ({
              id: item.id,
              label: item.id,
              status: 'passed',
              message: 'Passed',
            })),
            failedCaseIds: [],
            feedback: 'All passed',
            durationMs: 12,
          },
        },
      },
    );
    expect(result.status()).toBe(201);
    expect(await result.json()).toMatchObject({
      questId: detail.id,
      accepted: true,
      reportedPassed: true,
    });
  }
  expect(
    await (
      await request.get(
        `${apiOrigin}/api/v1/quests/finish-the-field-guide/progress`,
        own,
      )
    ).json(),
  ).toMatchObject({ availability: 'available' });

  await page.goto('/quests/finish-the-field-guide');
  await showLearningPanel(page, 'Code');
  await page.getByRole('tab', { name: 'style.css' }).click();
  const finalCss = page.getByRole('textbox', {
    name: 'style.css code editor (css)',
  });
  await expect(finalCss).toBeVisible({ timeout: 30_000 });
  await finalCss.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '.field-guide { max-width: 64rem; padding: 1rem; } .guide-stops { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; } @media (max-width: 600px) { .guide-stops { grid-template-columns: 1fr; } }',
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await showLearningPanel(page, 'Results');
  const finalPreview = page.getByRole('region', { name: 'Web preview' });
  await expect(finalPreview.getByRole('status')).toContainText(
    'Static preview ready',
  );
  await finalPreview.getByRole('button', { name: 'Narrow · 390px' }).click();
  await finalPreview.getByRole('button', { name: 'Wide · 1024px' }).click();
  await showLearningPanel(page, 'Code');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showLearningPanel(page, 'Results');
  await expect(page.getByText(/Local check passed/)).toBeVisible();

  await page.route('**/api/v1/learning-sync/CSS12', (route) => route.abort());
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(
    page.getByText(/delivery is pending or uncertain/),
  ).toBeVisible();
  await showLearningPanel(page, 'Code');
  await expect(finalCss).toContainText('grid-template-columns');
  await page.unroute('**/api/v1/learning-sync/CSS12');
  await page.goto('/account');
  await expect
    .poll(
      async () => {
        const progress = await request.get(
          `${apiOrigin}/api/v1/quests/finish-the-field-guide/progress`,
          own,
        );
        return (await progress.json()).status;
      },
      { timeout: 30_000 },
    )
    .toBe('completed');
  await expect(page.getByText('CSS12: delivery confirmed')).toBeVisible();
  expect(
    await (await request.get(`${apiOrigin}/api/v1/xp`, own)).json(),
  ).toMatchObject({ totalXp: 120 });
  await page.goto('/courses/css-foundations');
  await expect(
    page.getByRole('link', { name: 'Finish the field guide, Completed' }),
  ).toBeVisible();
  await page.goto('/quests/finish-the-field-guide');
  await page.reload();
  await showLearningPanel(page, 'Code');
  await page.getByRole('tab', { name: 'style.css' }).click();
  await expect(finalCss).toContainText('grid-template-columns');
});
