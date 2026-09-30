import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import solutions from './fixtures/foundations-solutions.json';

const captureFile = join(tmpdir(), 'codequest-analytics-playwright.jsonl');
const collector = 'https://capture.example.test/capture/';
const apiOrigin = 'http://127.0.0.1:3001';

interface CapturedEvent {
  event: string;
  distinct_id: string;
  properties: { source_trust: string; cohort: string; event_id: string };
}

async function interceptCollector(
  context: BrowserContext,
  records: CapturedEvent[],
) {
  await context.route('https://capture.example.test/**', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postData();
      if (body) records.push(JSON.parse(body) as CapturedEvent);
    }
    await route.fulfill({
      status: 200,
      body: '{}',
      headers: {
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-allow-headers': 'content-type',
      },
    });
  });
}

async function edit(page: Page, source: string) {
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(source);
}

async function accountSession(
  context: BrowserContext,
  ownerId: string,
): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(
    JSON.stringify({ sub: ownerId, exp: expires }),
  ).toString('base64url');
  const accessToken = `eyJhbGciOiJIUzI1NiJ9.${payload}.local-fixture`;
  const session = {
    access_token: accessToken,
    refresh_token: 'local-fixture',
    expires_at: expires,
    expires_in: 3600,
    token_type: 'bearer',
    user: { id: ownerId, email: 'analytics-fixture@example.test' },
  };
  await context.addCookies([
    {
      name: 'sb-auth-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`,
      url: 'http://127.0.0.1:3200',
    },
  ]);
  return accessToken;
}

function backendRecords(): CapturedEvent[] {
  const text = readFileSync(captureFile, 'utf8').trim();
  return text
    ? text.split('\n').map((line) => JSON.parse(line) as CapturedEvent)
    : [];
}

test('guest observations and accepted account facts reach only the fake collector', async ({
  browser,
}) => {
  test.setTimeout(90_000);
  writeFileSync(captureFile, '', 'utf8');
  const browserRecords: CapturedEvent[] = [];
  const ownerId = readFileSync(
    join(tmpdir(), 'codequest-analytics-owner.txt'),
    'utf8',
  ).trim();
  const guest = await browser.newContext({ baseURL: 'http://127.0.0.1:3200' });
  await interceptCollector(guest, browserRecords);
  const guestPage = await guest.newPage();
  await guestPage.goto('/quests/first-message');
  await expect(
    guestPage.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible();
  await edit(guestPage, solutions[0].reference);
  await guestPage.getByText('Question hint').click();
  await guestPage.getByRole('button', { name: 'Run', exact: true }).click();
  await expect
    .poll(() =>
      browserRecords.some(
        (event) =>
          event.event === 'first_code_run' &&
          event.properties.cohort === 'guest',
      ),
    )
    .toBe(true);
  expect(
    browserRecords.some(
      (event) =>
        event.event === 'first_quest_started' &&
        event.properties.cohort === 'guest',
    ),
  ).toBe(true);
  await expect
    .poll(() =>
      browserRecords.some(
        (event) =>
          event.event === 'hint_used' && event.properties.cohort === 'guest',
      ),
    )
    .toBe(true);

  const account = await browser.newContext({
    baseURL: 'http://127.0.0.1:3200',
  });
  await interceptCollector(account, browserRecords);
  const token = await accountSession(account, ownerId);
  const established = await account.request.put(`${apiOrigin}/api/v1/account`, {
    headers: { authorization: `Bearer ${token}` },
  });
  expect(established.status()).toBe(200);
  const accountPage = await account.newPage();
  await accountPage.goto('/quests/first-message');
  await expect(
    accountPage.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible();
  await edit(accountPage, solutions[0].reference);
  await accountPage.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(accountPage.getByText(/Local check passed/)).toBeVisible();
  await accountPage.getByRole('button', { name: 'Submit attempt' }).click();
  await expect
    .poll(
      () =>
        backendRecords().some(
          (event) =>
            event.event === 'quest_completed' && event.distinct_id === ownerId,
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
  const accepted = backendRecords().filter(
    (event) => event.event === 'quest_completed',
  );
  expect(accepted).toHaveLength(1);
  expect(accepted[0].properties).toMatchObject({
    cohort: 'account',
    source_trust: 'backend_fact',
  });
  expect(
    browserRecords
      .filter((event) => event.properties.cohort === 'guest')
      .every((event) => event.distinct_id !== ownerId),
  ).toBe(true);
  expect(
    browserRecords.every(
      (event) => event.properties.source_trust === 'client_observed',
    ),
  ).toBe(true);
  expect(
    JSON.stringify([...browserRecords, ...backendRecords()]),
  ).not.toContain(solutions[0].reference);

  const count = browserRecords.length;
  for (const origin of [
    'http://localhost:3200/runtime/bootstrap.html',
    'http://127.0.0.2:3200/preview/bootstrap.html',
  ]) {
    const isolated = await browser.newContext();
    await interceptCollector(isolated, browserRecords);
    const page = await isolated.newPage();
    await page.goto(origin);
    await page.evaluate(async (url) => {
      try {
        await fetch(url, { method: 'POST' });
      } catch {
        /* CSP rejects */
      }
    }, collector);
    await isolated.close();
  }
  expect(browserRecords).toHaveLength(count);
  await guest.close();
  await account.close();
});
