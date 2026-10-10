import { expect, test, type Page } from '@playwright/test';
import solutions from './fixtures/dom-solutions.json';

const application = 'http://127.0.0.1:3400';
const runner = 'http://127.0.0.2:3400';
const preview = 'http://localhost:3400';
const api = 'http://127.0.0.1:3431';

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
  await editor.fill(source);
  return editor;
}

test('selected production DOM01 route keeps runner and preview contained through recovery', async ({
  page,
  request,
  context,
}) => {
  test.setTimeout(300_000);
  const signup = await request.post('https://localhost:54322/auth/v1/signup', {
    data: {
      email: `dom-publication-${Date.now()}@example.test`,
      password: 'synthetic-only-password',
    },
  });
  expect(signup.status()).toBe(200);
  const session: unknown = await signup.json();
  await context.addCookies([
    {
      name: 'sb-localhost-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`,
      url: application,
    },
  ]);
  const detail = await request.get(`${api}/api/v1/quests/name-two-stations`);
  expect(detail.status()).toBe(200);
  expect(await detail.json()).toMatchObject({
    id: 'DOM01',
    contentVersion: '1.0.0',
    assessmentVersion: '1.0.0',
    exercise: { mode: 'interactive-web' },
  });
  for (const [origin, denied] of [
    [application, '/runtime/interactive-worker.js'],
    [application, '/preview/interactive-bridge.js'],
    [runner, '/account'],
    [runner, '/preview/interactive-bridge.js'],
    [preview, '/account'],
    [preview, '/runtime/interactive-worker.js'],
  ])
    expect((await request.get(`${origin}${denied}`)).status()).toBe(404);
  const runnerAsset = await request.get(
    `${runner}/runtime/interactive-worker.js`,
  );
  const previewAsset = await request.get(
    `${preview}/preview/interactive-bridge.js`,
  );
  expect(runnerAsset.status()).toBe(200);
  expect(previewAsset.status()).toBe(200);
  expect(runnerAsset.headers()['content-security-policy']).toContain(
    "connect-src 'none'",
  );
  expect(previewAsset.headers()['content-security-policy']).toContain(
    "connect-src 'none'",
  );
  expect(previewAsset.headers()['content-security-policy']).toContain(
    "frame-src 'self'",
  );

  await page.goto('/quests/name-two-stations', {
    waitUntil: 'domcontentloaded',
  });
  await showPanel(page, 'Code');
  await expect(
    page.getByRole('region', { name: 'Quest workspace' }),
  ).toBeVisible({ timeout: 30_000 });
  const editor = await editJavaScript(page, solutions[0].source);
  await showPanel(page, 'Results');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 10_000,
  });
  const shell = page.frameLocator(
    'iframe[title="Isolated interactive preview"]',
  );
  const child = shell.frameLocator('iframe[title="Interactive learner page"]');
  await expect(shell.locator('iframe')).toHaveAttribute(
    'sandbox',
    'allow-scripts',
  );
  expect(await child.locator('body').evaluate(() => location.origin)).toBe(
    'null',
  );
  expect(
    await child.locator('body').evaluate(() => {
      try {
        localStorage.setItem('probe', 'blocked');
        return 'available';
      } catch {
        return 'blocked';
      }
    }),
  ).toBe('blocked');
  expect(
    await child.locator('body').evaluate(() => {
      try {
        return window.top?.location.href ?? 'available';
      } catch {
        return 'blocked';
      }
    }),
  ).toBe('blocked');
  await expect(child.getByText('North: fern')).toBeVisible();
  await panel.getByRole('button', { name: 'Reload interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  await expect(child.getByText('North: fern')).toBeVisible();
  await page.evaluate(() => {
    const outer = document.querySelector<HTMLIFrameElement>(
      'iframe[title="Isolated interactive preview"]',
    );
    outer?.contentWindow?.postMessage(
      {
        type: 'mutate',
        generationId: 'forged',
        stepId: 'fake',
        mutations: [{ nodeId: 'n1', kind: 'text', value: 'Forged' }],
      },
      '*',
    );
  });
  await shell.locator('body').evaluate(() => {
    window.frames[0]?.postMessage(
      {
        type: 'mutate',
        generationId: 'forged',
        nonce: 'forged',
        stepId: 'fake',
        mutations: [{ nodeId: 'n1', kind: 'text', value: 'Forged' }],
      },
      '*',
    );
  });
  await expect(child.getByText('North: fern')).toBeVisible();

  await showPanel(page, 'Code');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await showPanel(page, 'Results');
  await expect(page.getByText(/Local check passed.*unverified/)).toBeVisible({
    timeout: 15_000,
  });

  for (let cycle = 0; cycle < 3; cycle += 1) {
    await editJavaScript(page, 'while (true) {}');
    await showPanel(page, 'Results');
    await panel.getByRole('button', { name: 'Start interactive' }).click();
    await expect(panel.getByRole('status')).toContainText('timed out', {
      timeout: 5_000,
    });
    await editJavaScript(page, solutions[0].source);
    await showPanel(page, 'Results');
    await panel.getByRole('button', { name: 'Start interactive' }).click();
    await expect(panel.getByRole('status')).toContainText('ready', {
      timeout: 5_000,
    });
    expect(
      Number(
        await panel
          .locator('[data-interactive-duration-ms]')
          .getAttribute('data-interactive-duration-ms'),
      ),
    ).toBeLessThan(1_000);
  }
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'index.html' }).click();
  await page
    .getByRole('textbox', { name: 'index.html code editor (html)' })
    .fill(
      '<main><button id="loop-button">Trigger</button><p id="north">North: unnamed</p><p id="south">South: unnamed</p></main>',
    );
  await editJavaScript(
    page,
    'document.getElementById("loop-button").addEventListener("click", () => { while (true) {} });',
  );
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  await child.getByRole('button', { name: 'Trigger' }).click();
  await expect(panel.getByRole('status')).toContainText('timed out', {
    timeout: 5_000,
  });
  await showPanel(page, 'Code');
  await expect(editor).toContainText('while (true)');
  await editJavaScript(page, solutions[0].source);
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  expect(
    Number(
      await panel
        .locator('[data-interactive-duration-ms]')
        .getAttribute('data-interactive-duration-ms'),
    ),
  ).toBeLessThan(1_000);

  await editJavaScript(
    page,
    'for (let index = 0; index < 257; index++) document.getElementById("north").textContent = String(index);',
  );
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText(/limit|unavailable/i);
  await expect(shell.locator('iframe')).toHaveCount(0);
  await editJavaScript(
    page,
    'for (let index = 0; index < 201; index++) console.log(index);',
  );
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText(/limit|unavailable/i);
  await editJavaScript(page, 'a'.repeat(65_537));
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText(/limit|unavailable/i);
  await editJavaScript(page, solutions[0].source);
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });

  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'index.html' }).click();
  await page
    .getByRole('textbox', { name: 'index.html code editor (html)' })
    .fill(
      '<main><button id="count">Count</button><p id="north">Count: 0</p></main>',
    );
  await editJavaScript(
    page,
    'let count = 0; document.getElementById("count").addEventListener("click", () => { count++; document.getElementById("north").textContent = "Count: " + count; });',
  );
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  for (let count = 1; count <= 64; count += 1) {
    await child.getByRole('button', { name: 'Count' }).click();
    await expect(child.getByText(`Count: ${count}`)).toBeVisible();
  }
  await child.getByRole('button', { name: 'Count' }).click();
  await expect(panel.getByRole('status')).toContainText(/limit/i);
  await expect(shell.locator('iframe')).toHaveCount(0);
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'index.html' }).click();
  await page
    .getByRole('textbox', { name: 'index.html code editor (html)' })
    .fill(
      '<main><p id="north">North: unnamed</p><p id="south">South: unnamed</p></main>',
    );
  await editJavaScript(page, solutions[0].source);
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });

  await editJavaScript(page, 'while (true) {}');
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await panel.getByRole('button', { name: 'Cancel interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('cancelled');
  await showPanel(page, 'Code');
  await expect(editor).toContainText('while (true)');

  const forbidden: string[] = [];
  await page.route('**/interactive-forbidden-sink', async (route) => {
    forbidden.push(route.request().url());
    await route.fulfill({ status: 204 });
  });
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'index.html' }).click();
  await page
    .getByRole('textbox', { name: 'index.html code editor (html)' })
    .fill(
      '<main><p id="north">Safe</p><script>fetch("/interactive-forbidden-sink")</script><iframe src="/interactive-forbidden-sink"></iframe><img src="/interactive-forbidden-sink" onerror="alert(1)"></main>',
    );
  await editJavaScript(
    page,
    'console.log(typeof fetch, typeof indexedDB, typeof Worker, typeof window);',
  );
  await showPanel(page, 'Results');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  await expect(
    panel.getByText('Active HTML content was removed'),
  ).toBeVisible();
  await expect(panel.getByLabel('Interactive console output')).toContainText(
    'undefined undefined undefined undefined',
  );
  expect(forbidden).toEqual([]);
  await page.goto('/courses', { waitUntil: 'domcontentloaded' });
  await expect(
    page.locator('iframe[title="Isolated interactive preview"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('iframe[title="Isolated interactive runner"]'),
  ).toHaveCount(0);
  await page.goto('/quests/name-two-stations');
  await editJavaScript(page, "console.log('OWNER_ONE_PREVIEW_DRAFT')");
  await page.getByRole('button', { name: /Save locally/ }).click();
  await expect(page.getByText('Saved on this device')).toBeVisible();
  const otherSignup = await request.post(
    'https://localhost:54322/auth/v1/signup',
    {
      data: {
        email: `dom-publication-other-${Date.now()}@example.test`,
        password: 'synthetic-only-password',
      },
    },
  );
  expect(otherSignup.status()).toBe(200);
  const otherSession: unknown = await otherSignup.json();
  await context.addCookies([
    {
      name: 'sb-localhost-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(otherSession)).toString('base64url')}`,
      url: application,
    },
  ]);
  await page.reload();
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'main.js' }).click();
  const otherEditor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await expect(otherEditor).toBeVisible();
  await expect(otherEditor).not.toContainText('OWNER_ONE_PREVIEW_DRAFT');
  await context.addCookies([
    {
      name: 'sb-localhost-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`,
      url: application,
    },
  ]);
  await page.reload();
  await showPanel(page, 'Code');
  await page.getByRole('tab', { name: 'main.js' }).click();
  await expect(
    page.getByRole('textbox', {
      name: 'main.js code editor (javascript)',
    }),
  ).toContainText('OWNER_ONE_PREVIEW_DRAFT');
});
