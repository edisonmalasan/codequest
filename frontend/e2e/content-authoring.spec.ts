import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

interface Fixture {
  questResponse: Record<string, unknown>;
  quest: {
    id: string;
    slug: string;
    contentVersion: string;
    assessmentVersion: string;
    cases: { id: string }[];
  };
  source: string;
  expected: 'pass' | 'fail';
  version: string;
  published: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadFixture(): Fixture {
  const path = process.env.CODEQUEST_AUTHOR_FIXTURE;
  if (!path) throw new Error('Missing author fixture');
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (
    !isRecord(raw) ||
    !isRecord(raw.quest) ||
    typeof raw.source !== 'string' ||
    Buffer.byteLength(raw.source, 'utf8') > 65_536 ||
    !['pass', 'fail'].includes(String(raw.expected)) ||
    typeof raw.version !== 'string' ||
    typeof raw.published !== 'boolean'
  )
    throw new Error('Invalid author fixture');
  const quest = raw.quest;
  if (
    typeof quest.id !== 'string' ||
    typeof quest.slug !== 'string' ||
    typeof quest.contentVersion !== 'string' ||
    typeof quest.assessmentVersion !== 'string' ||
    !Array.isArray(quest.cases) ||
    quest.cases.length < 2 ||
    quest.cases.length > 10 ||
    !quest.cases.every(
      (item: unknown) => isRecord(item) && typeof item.id === 'string',
    )
  )
    throw new Error('Invalid author Quest fixture');
  return {
    questResponse: quest,
    quest: {
      id: quest.id,
      slug: quest.slug,
      contentVersion: quest.contentVersion,
      assessmentVersion: quest.assessmentVersion,
      cases: quest.cases,
    },
    source: raw.source,
    expected: raw.expected === 'pass' ? 'pass' : 'fail',
    version: raw.version,
    published: raw.published,
  };
}

const fixture = loadFixture();

test('selected authored cases run through isolated browser Check', async ({
  page,
  context,
}) => {
  test.setTimeout(60_000);
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const userId = '00000000-0000-4000-8000-000000000037';
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: expires }),
  ).toString('base64url');
  const session = {
    access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.local-author-fixture`,
    refresh_token: 'local-author-fixture',
    expires_at: expires,
    expires_in: 3600,
    token_type: 'bearer',
    user: { id: userId, email: 'author@example.test' },
  };
  await context.addCookies([
    {
      name: 'sb-auth-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`,
      url: 'http://127.0.0.1:3310',
    },
  ]);
  const submissionRequests: string[] = [];
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    if (
      request.method() === 'GET' &&
      new URL(request.url()).pathname === `/api/v1/quests/${fixture.quest.slug}`
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixture.questResponse),
      });
      return;
    }
    if (
      request.method() !== 'GET' &&
      /attempt|submission|sync|import/.test(request.url())
    )
      submissionRequests.push(request.url());
    await route.abort();
  });
  await page.goto(`/quests/${fixture.quest.slug}`);
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Load code editor' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(fixture.source);
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  const results = page
    .getByRole('heading', { name: 'Test results' })
    .locator('..');
  await expect(results.getByText(/Local check (passed|failed)/)).toBeVisible({
    timeout: 10_000,
  });
  const status = (await results.getByRole('status').textContent()) ?? '';
  const rows = await results
    .locator('ul')
    .last()
    .locator('li')
    .allTextContents();
  if (
    /timed out|timeout/i.test(status) ||
    rows.some((row) => /timed out|timeout/i.test(row))
  ) {
    expect(
      (await editor.locator('.cm-line').allTextContents()).join('\n'),
    ).toBe(fixture.source);
    await editor.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText('console.log("recovered");');
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await expect(results.getByText(/Local check (passed|failed)/)).toBeVisible({
      timeout: 10_000,
    });
    const recovery = (await results.getByRole('status').textContent()) ?? '';
    expect(recovery).not.toMatch(/timed out|timeout/i);
    throw new Error(
      'Candidate timed out; a fresh Worker completed a later finite Check',
    );
  }
  const ids = fixture.quest.cases.map((item) => item.id);
  expect(rows).toHaveLength(ids.length);
  for (const [index, id] of ids.entries()) expect(rows[index]).toContain(id);
  const passed = status.includes('Local check passed');
  process.stdout.write(
    `${fixture.quest.id} content ${fixture.version} / assessment ${fixture.quest.assessmentVersion} (${fixture.published ? 'published selection' : 'unpublished snapshot'}): ${passed ? 'passed' : 'failed'}\n`,
  );
  for (const [index, id] of ids.entries())
    process.stdout.write(`${id}: ${rows[index].slice(0, 180)}\n`);
  expect(submissionRequests).toEqual([]);
  expect(passed).toBe(fixture.expected === 'pass');
  if (fixture.expected === 'fail')
    expect(rows.some((row) => /failed/i.test(row))).toBe(true);
});
