import { randomUUID } from 'node:crypto';
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from '@playwright/test';
import solutions from './fixtures/dom-solutions.json';

const apiOrigin = 'http://127.0.0.1:3001';
const authOrigin = 'http://127.0.0.1:54321';
const appOrigin = 'http://127.0.0.1:3200';

interface QuestDetail {
  id: string;
  slug: string;
  kind: 'instructional' | 'capstone';
  contentVersion: string;
  assessmentVersion: string;
  starterCode: string;
  cases: Array<{ id: string }>;
  exercise?: {
    mode: 'javascript' | 'static-web' | 'interactive-web';
    files: Array<{
      id: string;
      language: 'html' | 'css' | 'javascript';
      starterSource: string;
    }>;
  };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function questDetail(value: unknown): value is QuestDetail {
  if (!record(value)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    ['instructional', 'capstone'].includes(String(value.kind)) &&
    typeof value.contentVersion === 'string' &&
    typeof value.assessmentVersion === 'string' &&
    typeof value.starterCode === 'string' &&
    Array.isArray(value.cases) &&
    value.cases.every(
      (item: unknown) => record(item) && typeof item.id === 'string',
    ) &&
    (value.exercise === undefined ||
      (record(value.exercise) &&
        ['javascript', 'static-web', 'interactive-web'].includes(
          String(value.exercise.mode),
        ) &&
        Array.isArray(value.exercise.files) &&
        value.exercise.files.every(
          (item: unknown) =>
            record(item) &&
            typeof item.id === 'string' &&
            ['html', 'css', 'javascript'].includes(String(item.language)) &&
            typeof item.starterSource === 'string',
        )))
  );
}

async function getQuest(
  request: APIRequestContext,
  slug: string,
): Promise<QuestDetail> {
  const response = await request.get(`${apiOrigin}/api/v1/quests/${slug}`);
  expect(response.status()).toBe(200);
  const payload: unknown = await response.json();
  if (!questDetail(payload))
    throw new Error(`Invalid Quest detail for ${slug}`);
  return payload;
}

async function courseQuestSlugs(
  request: APIRequestContext,
  slug: string,
): Promise<string[]> {
  const course = await request.get(`${apiOrigin}/api/v1/courses/${slug}`);
  expect(course.status()).toBe(200);
  const payload: unknown = await course.json();
  if (!record(payload) || !Array.isArray(payload.chapters))
    throw new Error(`Invalid Course detail for ${slug}`);
  const slugs: string[] = [];
  for (const chapter of payload.chapters) {
    if (!record(chapter) || typeof chapter.slug !== 'string')
      throw new Error('Invalid chapter summary');
    const response = await request.get(
      `${apiOrigin}/api/v1/chapters/${chapter.slug}`,
    );
    expect(response.status()).toBe(200);
    const detail: unknown = await response.json();
    if (!record(detail) || !Array.isArray(detail.quests))
      throw new Error('Invalid chapter detail');
    for (const quest of detail.quests) {
      if (!record(quest) || typeof quest.slug !== 'string')
        throw new Error('Invalid Quest summary');
      slugs.push(quest.slug);
    }
  }
  return slugs;
}

function sourceFor(quest: QuestDetail, javascript?: string): string {
  if (!quest.exercise || quest.exercise.mode === 'javascript')
    return javascript ?? quest.starterCode;
  return JSON.stringify({
    schemaVersion: 1,
    questId: quest.id,
    contentVersion: quest.contentVersion,
    assessmentVersion: quest.assessmentVersion,
    mode: quest.exercise.mode,
    files: quest.exercise.files.map((file) => ({
      id: file.id,
      language: file.language,
      source:
        file.language === 'javascript' && javascript !== undefined
          ? javascript
          : file.starterSource,
    })),
  });
}

function passingReport(quest: QuestDetail) {
  return {
    checkId: randomUUID(),
    status: 'completed',
    passed: true,
    cases: quest.cases.map((item) => ({
      id: item.id,
      label: item.id,
      status: 'passed',
      message: 'Passed',
    })),
    failedCaseIds: [],
    feedback: 'All passed',
    durationMs: 12,
  };
}

async function acceptReported(
  request: APIRequestContext,
  slug: string,
  token: string,
  javascript?: string,
) {
  const quest = await getQuest(request, slug);
  const response = await request.post(
    `${apiOrigin}/api/v1/quests/${slug}/attempts`,
    {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        clientEventId: randomUUID(),
        contentVersion: quest.contentVersion,
        assessmentVersion: quest.assessmentVersion,
        source: sourceFor(quest, javascript),
        report: passingReport(quest),
      },
    },
  );
  expect(response.status(), `${quest.id} acceptance`).toBe(201);
  expect(await response.json()).toMatchObject({
    questId: quest.id,
    accepted: true,
  });
  return quest;
}

async function syntheticAccount(request: APIRequestContext) {
  const response = await request.post(`${authOrigin}/auth/v1/signup`, {
    data: {
      email: `dom-course-${randomUUID()}@example.test`,
      password: 'testing-password-123',
    },
  });
  expect(response.status()).toBe(200);
  const session: unknown = await response.json();
  if (
    !record(session) ||
    typeof session.access_token !== 'string' ||
    !record(session.user)
  )
    throw new Error('Synthetic Auth session is unavailable');
  return { token: session.access_token, session };
}

async function showPanel(page: Page, label: 'Code' | 'Results') {
  if ((page.viewportSize()?.width ?? 1280) <= 1100)
    await page.getByRole('button', { name: label, exact: true }).click();
}

async function editJavaScript(page: Page, source: string) {
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'main.js' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await expect(editor).toBeVisible({ timeout: 30_000 });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(source);
  return editor;
}

test('selected DOM Course traverses owner-bound prerequisites, Check, accepted progress and replay', async ({
  page,
  request,
}) => {
  test.setTimeout(600_000);
  const owner = await syntheticAccount(request);
  const other = await syntheticAccount(request);
  await page.context().addCookies([
    {
      name: 'sb-127-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(owner.session)).toString('base64url')}`,
      url: appOrigin,
    },
  ]);
  const dom01 = await getQuest(request, 'name-two-stations');
  const locked = await request.post(
    `${apiOrigin}/api/v1/quests/${dom01.slug}/attempts`,
    {
      headers: { Authorization: `Bearer ${owner.token}` },
      data: {
        clientEventId: randomUUID(),
        contentVersion: dom01.contentVersion,
        assessmentVersion: dom01.assessmentVersion,
        source: sourceFor(dom01, solutions[0].source),
        report: passingReport(dom01),
      },
    },
  );
  expect(locked.status()).toBe(409);

  for (const course of [
    'javascript-foundations',
    'html-foundations',
    'css-foundations',
  ]) {
    const slugs = await courseQuestSlugs(request, course);
    for (const slug of slugs) {
      const quest = await getQuest(request, slug);
      if (quest.id === 'CAP01') continue;
      // Backend acceptance is personal learning. These synthetic client reports
      // exercise prerequisites, not independent grading of prerequisite code.
      await acceptReported(request, slug, owner.token);
    }
  }
  const own = { headers: { Authorization: `Bearer ${owner.token}` } };
  const otherOwner = { headers: { Authorization: `Bearer ${other.token}` } };
  expect(
    await (
      await request.get(
        `${apiOrigin}/api/v1/quests/${dom01.slug}/progress`,
        own,
      )
    ).json(),
  ).toMatchObject({ availability: 'available' });
  await page.goto('/courses/dom-foundations');
  await expect(
    page.getByRole('heading', { name: 'DOM Foundations' }),
  ).toBeVisible();
  await expect(page.locator('main ol ol > li')).toHaveCount(12);
  await page.goto(`/quests/${dom01.slug}`);
  await editJavaScript(page, solutions[0].source);
  await showPanel(page, 'Results');
  const interactive = page.getByRole('region', { name: 'Interactive result' });
  await interactive.getByRole('button', { name: 'Start interactive' }).click();
  await expect(interactive.getByRole('status')).toContainText('ready');
  const display = page
    .frameLocator('iframe[title="Isolated interactive preview"]')
    .frameLocator('iframe[title="Interactive learner page"]');
  await expect(display.getByText('North: fern')).toBeVisible();
  await showPanel(page, 'Code');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showPanel(page, 'Results');
  await expect(page.getByText(/Local check passed.*unverified/)).toBeVisible();
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(page.getByText(/Submission delivery confirmed/)).toBeVisible();
  expect(
    await (
      await request.get(
        `${apiOrigin}/api/v1/quests/${dom01.slug}/progress`,
        own,
      )
    ).json(),
  ).toMatchObject({ status: 'completed' });
  expect(
    await (
      await request.get(
        `${apiOrigin}/api/v1/quests/${dom01.slug}/progress`,
        otherOwner,
      )
    ).json(),
  ).toMatchObject({ availability: 'locked' });
  const history = await (
    await request.get(`${apiOrigin}/api/v1/quests/${dom01.slug}/attempts`, own)
  ).json();
  expect(history).toMatchObject({ attemptCount: 1 });
  expect(
    await (
      await request.get(
        `${apiOrigin}/api/v1/quests/${dom01.slug}/attempts`,
        otherOwner,
      )
    ).json(),
  ).toMatchObject({ attemptCount: 0 });
  const first = history.attempts[0];
  const replay = await request.post(`${apiOrigin}/api/v1/learning-sync/DOM01`, {
    ...own,
    data: {
      clientEventId: first.clientEventId,
      contentVersion: first.contentVersion,
      assessmentVersion: first.assessmentVersion,
      source: first.source,
      report: first.report,
    },
  });
  expect(replay.status()).toBe(201);
  expect(await replay.json()).toMatchObject({ id: first.id, attemptCount: 1 });
  expect(
    await (await request.get(`${apiOrigin}/api/v1/xp`, own)).json(),
  ).toMatchObject({ totalXp: 490 });
  await expect(
    page
      .getByRole('navigation', { name: 'Exercise sequence' })
      .getByRole('link', { name: /Next: Summarize a reading/ }),
  ).toBeVisible();

  const domSlugs = await courseQuestSlugs(request, 'dom-foundations');
  expect(domSlugs).toHaveLength(12);
  for (const [index, slug] of domSlugs.entries()) {
    if (index === 0 || index === 11) continue;
    await acceptReported(request, slug, owner.token, solutions[index].source);
  }
  expect(
    await (
      await request.get(
        `${apiOrigin}/api/v1/quests/build-a-status-board/progress`,
        own,
      )
    ).json(),
  ).toMatchObject({ availability: 'available' });
  await page.goto('/quests/build-a-status-board');
  const finalEditor = await editJavaScript(page, solutions[11].source);
  await page
    .getByRole('textbox', { name: 'Debug explanation' })
    .fill(
      'The click listener reads the current input; empty input gets a useful status message.',
    );
  await page
    .getByRole('textbox', { name: 'Transfer response' })
    .fill(
      'A second board could use the same input, button, and text status pattern with different labels.',
    );
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showPanel(page, 'Results');
  await expect(page.getByText(/Local check passed.*unverified/)).toBeVisible();
  await page.route('**/api/v1/learning-sync/DOM12', (route) => route.abort());
  await page.getByRole('button', { name: 'Submit attempt' }).click();
  await expect(
    page.getByText(/delivery is pending or uncertain/),
  ).toBeVisible();
  await page.unroute('**/api/v1/learning-sync/DOM12');
  await page.goto('/account');
  await expect
    .poll(
      async () =>
        (
          await (
            await request.get(
              `${apiOrigin}/api/v1/quests/build-a-status-board/progress`,
              own,
            )
          ).json()
        ).status,
      { timeout: 30_000 },
    )
    .toBe('completed');
  expect(
    await (await request.get(`${apiOrigin}/api/v1/xp`, own)).json(),
  ).toMatchObject({ totalXp: 600 });
  await page.goto('/courses/dom-foundations');
  await expect(
    page.getByRole('link', { name: 'Build a status board, Completed' }),
  ).toBeVisible();
  await page.goto('/quests/build-a-status-board');
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'main.js' }).click();
  await expect(finalEditor).toContainText('Saved plot');
  await page.reload();
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'main.js' }).click();
  await expect(finalEditor).toContainText('Saved plot');

  await page.context().addCookies([
    {
      name: 'sb-127-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(other.session)).toString('base64url')}`,
      url: appOrigin,
    },
  ]);
  await page.reload();
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'main.js' }).click();
  await expect(finalEditor).not.toContainText('Saved plot');
  expect(
    await (
      await request.get(
        `${apiOrigin}/api/v1/quests/build-a-status-board/attempts`,
        otherOwner,
      )
    ).json(),
  ).toMatchObject({ attemptCount: 0 });
  await page.context().addCookies([
    {
      name: 'sb-127-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(owner.session)).toString('base64url')}`,
      url: appOrigin,
    },
  ]);
  await page.reload();
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'main.js' }).click();
  await expect(finalEditor).toContainText('Saved plot');
});
