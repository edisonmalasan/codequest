import { expect, test } from '@playwright/test';
import { appOrigin, previewOrigin, runtimeOrigin } from './test-origins';

test('interactive Worker updates an opaque preview through bounded events', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  const htmlTab = page.getByRole('tab', { name: 'index.html' });
  await htmlTab.click();
  const htmlEditor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await htmlEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '<main><h1 id="count">0</h1><button id="add">Add</button><input id="name" type="text" placeholder="Name"><p id="echo"></p></main>',
  );
  await page.getByRole('tab', { name: 'main.js' }).click();
  const jsEditor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await jsEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    'let count = 0; document.getElementById("add").addEventListener("click", () => { document.getElementById("count").textContent = String(++count); console.log("count", count); }); document.getElementById("name").addEventListener("input", (event) => { document.getElementById("echo").textContent = event.target.value; });',
  );
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
  await child.getByRole('button', { name: 'Add' }).click();
  await expect(child.getByRole('heading', { name: '1' })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await child.getByRole('button', { name: 'Add' }).focus();
  await page.keyboard.press('Enter');
  await expect(child.getByRole('heading', { name: '2' })).toBeVisible();
  await child.getByRole('textbox', { name: 'Name' }).fill('Ava');
  await expect(child.getByText('Ava')).toBeVisible();
  await expect(panel.getByLabel('Interactive console output')).toContainText(
    'count 1',
  );
  expect(
    (
      await page.request.get(`${appOrigin}/preview/interactive-bootstrap.html`)
    ).status(),
  ).toBe(404);
  expect((await page.request.get(`${previewOrigin}/login`)).status()).toBe(404);
  expect(
    (await page.request.get(`${previewOrigin}/auth/callback`)).status(),
  ).toBe(404);
  expect((await page.request.get(`${previewOrigin}/account`)).status()).toBe(
    404,
  );
  expect((await page.request.get(`${previewOrigin}/api/health`)).status()).toBe(
    404,
  );
  expect(
    (
      await page.request.get(`${runtimeOrigin}/preview/interactive-bridge.js`)
    ).status(),
  ).toBe(404);
  const bridge = await page.request.get(
    `${previewOrigin}/preview/interactive-bridge.js`,
  );
  expect(bridge.headers()['content-security-policy']).toContain(
    "connect-src 'none'",
  );
  expect(bridge.headers()['cache-control']).toContain('no-store');
  const worker = await page.request.get(
    `${runtimeOrigin}/runtime/interactive-worker.js`,
  );
  expect(worker.headers()['content-security-policy']).toContain(
    "script-src 'unsafe-eval'",
  );
  expect(worker.headers()['content-security-policy']).toContain(
    "worker-src 'none'",
  );
  expect(worker.headers()['content-security-policy']).toContain(
    "connect-src 'none'",
  );
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(
      panel.getByRole('button', { name: 'Start interactive' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await jsEditor.fill('console.log("changed after snapshot");');
  await expect(panel.getByRole('status')).toContainText('Source changed');
  await expect(shell.locator('iframe')).toHaveCount(0);
});

test('hostile source times out and a finite run recovers without losing the draft', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('while (true) {}');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('timed out', {
    timeout: 5_000,
  });
  await expect(editor).toContainText('while (true)');
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    'document.querySelector("h1").textContent = "Recovered";',
  );
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
  const child = page
    .frameLocator('iframe[title="Isolated interactive preview"]')
    .frameLocator('iframe[title="Interactive learner page"]');
  await expect(child.getByRole('heading', { name: 'Recovered' })).toBeVisible();
});

test('active markup, CSS sinks, and forged messages stay contained', async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route('**/interactive-forbidden-sink', async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ status: 204 });
  });
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await page.getByRole('tab', { name: 'index.html' }).click();
  const htmlEditor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await htmlEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '<main><h1 id="title">Safe</h1><a href="/interactive-forbidden-sink">No navigation</a><script>fetch("/interactive-forbidden-sink")</script><iframe src="/interactive-forbidden-sink"></iframe><img src="/interactive-forbidden-sink" onerror="alert(1)"></main>',
  );
  await page.getByRole('tab', { name: 'styles.css' }).click();
  const cssEditor = page.getByRole('textbox', {
    name: 'styles.css code editor (css)',
  });
  await cssEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '@import url("/interactive-forbidden-sink"); h1 { background-image: url("/interactive-forbidden-sink"); color: green; }',
  );
  await page.getByRole('tab', { name: 'main.js' }).click();
  const jsEditor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await jsEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    'console.log(typeof fetch, typeof indexedDB, typeof Worker, typeof window);',
  );
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready');
  await expect(
    panel.getByText('Active HTML content was removed'),
  ).toBeVisible();
  await expect(panel.getByLabel('Interactive console output')).toContainText(
    'undefined undefined undefined undefined',
  );
  const shell = page.frameLocator(
    'iframe[title="Isolated interactive preview"]',
  );
  const child = shell.frameLocator('iframe[title="Interactive learner page"]');
  await expect(shell.locator('iframe')).toHaveCount(1);
  await expect(child.getByRole('heading', { name: 'Safe' })).toBeVisible();
  await expect(
    child.locator(
      'iframe, script[src^="/interactive-forbidden"], a[href], img[src^="/"]',
    ),
  ).toHaveCount(0);
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
  await expect(child.getByRole('heading', { name: 'Safe' })).toBeVisible();
  expect(requests).toEqual([]);
});

test('a looping event handler terminates and a finite session recovers', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await page.getByRole('tab', { name: 'index.html' }).click();
  const htmlEditor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await htmlEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('<button id="go">Go</button>');
  await page.getByRole('tab', { name: 'main.js' }).click();
  const jsEditor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await jsEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    'document.getElementById("go").addEventListener("click", () => { while (true) {} });',
  );
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready');
  const child = page
    .frameLocator('iframe[title="Isolated interactive preview"]')
    .frameLocator('iframe[title="Interactive learner page"]');
  await child.getByRole('button', { name: 'Go' }).click();
  await expect(panel.getByRole('status')).toContainText('timed out', {
    timeout: 5_000,
  });
  await expect(jsEditor).toContainText('while (true)');
  await jsEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('console.log("recovered");');
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
  await expect(panel.getByLabel('Interactive console output')).toContainText(
    'recovered',
  );
});

test('a mutation flood fails without applying partial page updates', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill(
    'for (let i = 0; i < 257; i++) document.querySelector("h1").textContent = String(i);',
  );
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText(/limit|unavailable/i);
  await expect(
    page.locator('iframe[title="Isolated interactive preview"] iframe'),
  ).toHaveCount(0);
  await expect(editor).toContainText('257');
  await editor.fill('document.querySelector("h1").textContent = "Fresh";');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready');
  const child = page
    .frameLocator('iframe[title="Isolated interactive preview"]')
    .frameLocator('iframe[title="Interactive learner page"]');
  await expect(child.getByRole('heading', { name: 'Fresh' })).toBeVisible();
});

test('cancel stops an in-flight loop and keeps the source editable', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill('while (true) {}');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await panel.getByRole('button', { name: 'Cancel interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('cancelled');
  await expect(editor).toContainText('while (true)');
  await editor.fill('console.log("after cancel");');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  await expect(panel.getByLabel('Interactive console output')).toContainText(
    'after cancel',
  );
});

test('a forged global Worker message cannot be accepted as a step', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill(`
    let parent = Object.getPrototypeOf(globalThis);
    while (parent && !Object.hasOwn(parent, 'postMessage')) parent = Object.getPrototypeOf(parent);
    if (parent) parent.postMessage.call(globalThis, JSON.stringify({ type: 'step', status: 'ready', output: [], mutations: [] }));
    while (true) {}
  `);
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText(
    /invalid|timed out|unavailable/i,
    { timeout: 5_000 },
  );
  await expect(panel.getByRole('status')).not.toContainText('ready');
  await expect(editor).toContainText('postMessage.call');
  await editor.fill('console.log("private-channel recovery");');
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  await expect(panel.getByLabel('Interactive console output')).toContainText(
    'private-channel recovery',
  );
});

test('route unmount releases runner and display frames', async ({ page }) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready');
  await expect(
    page.locator('iframe[title="Isolated interactive runner"]'),
  ).toHaveCount(1);
  await expect(
    page.locator('iframe[title="Isolated interactive preview"]'),
  ).toHaveCount(1);
  await page.goto('/courses');
  await expect(
    page.locator('iframe[title="Isolated interactive runner"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('iframe[title="Isolated interactive preview"]'),
  ).toHaveCount(0);
});

test('100 hostile loops each allow a fresh finite session', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'The 100-cycle endurance gate runs once; all engines run focused recovery probes.',
  );
  test.setTimeout(480_000);
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  for (let cycle = 0; cycle < 100; cycle += 1) {
    await editor.fill('while (true) {}');
    await panel.getByRole('button', { name: 'Start interactive' }).click();
    await expect(panel.getByRole('status')).toContainText('timed out', {
      timeout: 5_000,
    });
    await editor.fill(`console.log("recovered-${cycle}");`);
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
    await expect(panel.getByLabel('Interactive console output')).toContainText(
      `recovered-${cycle}`,
    );
    await expect(
      page.locator('iframe[title="Isolated interactive runner"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('iframe[title="Isolated interactive preview"]'),
    ).toHaveCount(1);
  }
});
