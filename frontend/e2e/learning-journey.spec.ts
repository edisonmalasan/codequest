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
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(source);
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
  test.setTimeout(120_000);
  const prematureWrites: string[] = [];
  page.on('request', (request) => {
    if (
      request.url().startsWith(`${apiOrigin}/api/v1/`) &&
      request.method() !== 'GET'
    )
      prematureWrites.push(request.url());
  });
  await page.goto(`/quests/${q01.slug}`);
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible();
  await edit(page, q01.reference);
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(page.getByText('I am ready to code!').last()).toBeVisible();
  await page.getByRole('button', { name: 'Check', exact: true }).click();
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
  await expect(page.getByText(/total XP/)).toBeVisible();
  await expect(page.getByText(/Current streak: 1 days/)).toBeVisible();
  await page.getByText('View and copy saved guest source').click();
  await expect(page.getByText(q01.reference, { exact: true })).toBeVisible();

  await page.goto(`/quests/${q02.slug}`);
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible();
  await edit(page, q02.reference);
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText(/Local check passed/)).toBeVisible();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await expect(page.getByText(/Submission delivery confirmed/)).toBeVisible();
  const response = await request.get(`${apiOrigin}/api/v1/quests/${q02.slug}`);
  expect(response.status()).toBe(200);
  await page.goto('/account');
  await expect(page.getByText('Q01: provisional Check saved')).toBeVisible();
});
