import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const app = 'http://127.0.0.1:3500';
const runner = 'http://127.0.0.2:3500';
const preview = 'http://localhost:3500';

async function createBuild(page: Page): Promise<string> {
  await page.goto('/builds', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('No Builds on this device yet.')).toBeVisible();
  await page.getByRole('button', { name: 'New Build' }).click();
  await expect(page).toHaveURL(/\/builds\/[0-9a-f-]{36}$/);
  await expect(
    page.getByRole('region', { name: 'Build workspace' }),
  ).toBeVisible();
  return page.url();
}

async function selectLocalOwner(
  context: BrowserContext,
  owner: string,
): Promise<void> {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const payload = Buffer.from(
    JSON.stringify({ sub: owner, exp: expires }),
  ).toString('base64url');
  const session = {
    access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.local-fixture`,
    refresh_token: 'local-fixture',
    expires_at: expires,
    expires_in: 3600,
    token_type: 'bearer',
    user: { id: owner, email: `${owner}@example.test` },
  };
  await context.addCookies([
    {
      name: 'sb-localhost-auth-token',
      value: `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`,
      url: app,
    },
  ]);
}

test('production Build creates, runs, saves and reopens without learning authority', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const applicationWrites: string[] = [];
  page.on('request', (outgoing) => {
    if (
      outgoing.url().startsWith('http://127.0.0.1:3001/api/v1/') &&
      outgoing.method() !== 'GET'
    )
      applicationWrites.push(outgoing.url());
  });
  for (const [origin, denied] of [
    [app, '/runtime/interactive-worker.js'],
    [app, '/preview/interactive-bridge.js'],
    [runner, '/account'],
    [runner, '/builds'],
    [runner, '/preview/interactive-bridge.js'],
    [preview, '/account'],
    [preview, '/builds'],
    [preview, '/runtime/interactive-worker.js'],
  ])
    expect((await request.get(`${origin}${denied}`)).status()).toBe(404);
  expect(
    (await request.get(`${runner}/runtime/interactive-worker.js`)).status(),
  ).toBe(200);
  expect(
    (await request.get(`${preview}/preview/interactive-bridge.js`)).status(),
  ).toBe(200);

  const buildUrl = await createBuild(page);
  expect(page.getByRole('button', { name: 'Check' })).toHaveCount(0);
  expect(page.getByRole('button', { name: 'Submit' })).toHaveCount(0);
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await panel.getByRole('button', { name: 'Run Build' }).click();
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
  await child.getByRole('button', { name: 'Change the message' }).click();
  await expect(child.getByText('You made it yours!')).toBeVisible();
  await panel.getByRole('button', { name: 'Reload Build' }).click();
  await expect(panel.getByRole('status')).toContainText('ready');

  await page.getByRole('tab', { name: 'main.js' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill(
    'document.getElementById("message").textContent = "My own Build";',
  );
  await expect(panel.getByRole('status')).toContainText('Source changed');
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole('link', { name: 'All Builds' }).click();
  await expect(
    page.getByRole('link', { name: 'Open Web Build 1' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Open Web Build 1' }).click();
  await expect(page).toHaveURL(buildUrl);
  await expect(page.getByRole('tab', { name: 'main.js' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(
    page.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
  ).toContainText('My own Build');
  await page.reload();
  await expect(
    page.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
  ).toContainText('My own Build');
  await page.goto('/courses', { waitUntil: 'domcontentloaded' });
  await expect(
    page.locator('iframe[title="Isolated interactive preview"]'),
  ).toHaveCount(0);
  expect(applicationWrites).toEqual([]);
});

test('hostile Build loops and forbidden sinks recover without losing source', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const forbidden: string[] = [];
  await page.route('**/build-forbidden-sink', async (route) => {
    forbidden.push(route.request().url());
    await route.fulfill({ status: 204 });
  });
  await createBuild(page);
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await page.getByRole('tab', { name: 'index.html' }).click();
  await page
    .getByRole('textbox', { name: 'index.html code editor (html)' })
    .fill(
      '<h1 id="title">Safe</h1><a href="/build-forbidden-sink">No</a><script>fetch("/build-forbidden-sink")</script><button id="go">Go</button>',
    );
  await page.getByRole('tab', { name: 'style.css' }).click();
  await page
    .getByRole('textbox', { name: 'style.css code editor (css)' })
    .fill(
      '@import url("/build-forbidden-sink"); h1 { background-image: url("/build-forbidden-sink"); }',
    );
  await page.getByRole('tab', { name: 'main.js' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill(
    'document.getElementById("go").addEventListener("click", () => { while (true) {} });',
  );
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 10_000,
  });
  await expect(
    panel.getByText('Active HTML content was removed'),
  ).toBeVisible();
  const shell = page.frameLocator(
    'iframe[title="Isolated interactive preview"]',
  );
  const child = shell.frameLocator('iframe[title="Interactive learner page"]');
  await expect(child.getByRole('heading', { name: 'Safe' })).toBeVisible();
  const oldIdentity = await child.locator('body').evaluate(() => {
    const bridge = document.querySelector<HTMLScriptElement>(
      'script[src="/preview/interactive-bridge.js"]',
    );
    return {
      nonce: bridge?.dataset.nonce,
      generationId: bridge?.dataset.generation,
    };
  });
  expect(
    await child.locator('body').evaluate(() => {
      try {
        localStorage.setItem('build-probe', 'blocked');
        return 'available';
      } catch {
        return 'blocked';
      }
    }),
  ).toBe('blocked');
  await child.getByRole('button', { name: 'Go' }).click();
  await expect(panel.getByRole('status')).toContainText('timed out', {
    timeout: 5_000,
  });
  await expect(editor).toContainText('while (true)');
  await editor.fill(
    'document.getElementById("title").textContent = "Recovered"; document.getElementById("go").addEventListener("click", () => { document.getElementById("title").textContent = "Current event"; }); console.log(typeof fetch, typeof Worker, typeof window);',
  );
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  await expect(child.getByRole('heading', { name: 'Recovered' })).toBeVisible();
  await expect(panel.getByLabel('Interactive console output')).toContainText(
    'undefined undefined undefined',
  );
  await child.getByRole('button', { name: 'Go' }).evaluate((button, old) => {
    parent.postMessage(
      {
        type: 'interaction',
        nonce: old.nonce,
        generationId: old.generationId,
        sequence: 1,
        targetId: button.getAttribute('data-cq-node'),
        eventType: 'click',
      },
      '*',
    );
  }, oldIdentity);
  await expect(child.getByRole('heading', { name: 'Recovered' })).toBeVisible();
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
  await expect(child.getByRole('heading', { name: 'Recovered' })).toBeVisible();
  await child.getByRole('button', { name: 'Go' }).click();
  await expect(
    child.getByRole('heading', { name: 'Current event' }),
  ).toBeVisible();
  expect(forbidden).toEqual([]);
});

test('Build output flood is bounded and a later run recovers', async ({
  page,
}) => {
  await createBuild(page);
  await page.getByRole('tab', { name: 'main.js' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill(
    'for (let i = 0; i < 257; i++) document.querySelector("h1").textContent = String(i);',
  );
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await expect(panel.getByRole('status')).toContainText(/limit|unavailable/i, {
    timeout: 10_000,
  });
  await expect(
    page.locator('iframe[title="Isolated interactive preview"] iframe'),
  ).toHaveCount(0);
  await expect(editor).toContainText('257');
  await editor.fill('document.querySelector("h1").textContent = "Fresh";');
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  const child = page
    .frameLocator('iframe[title="Isolated interactive preview"]')
    .frameLocator('iframe[title="Interactive learner page"]');
  await expect(child.getByRole('heading', { name: 'Fresh' })).toBeVisible();
  await editor.fill('for (let i = 0; i < 201; i++) console.log("line", i);');
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await expect(panel.getByRole('status')).toContainText(/limit|unavailable/i, {
    timeout: 10_000,
  });
  await expect(editor).toContainText('201');
  await editor.fill(
    'document.querySelector("h1").textContent = "After output";',
  );
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  await expect(
    child.getByRole('heading', { name: 'After output' }),
  ).toBeVisible();
});

test('cancelled Build Run leaves the draft intact for a fresh run', async ({
  page,
}) => {
  await createBuild(page);
  await page.getByRole('tab', { name: 'main.js' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill('while (true) {}');
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await panel.getByRole('button', { name: 'Cancel Build' }).click();
  await expect(panel.getByRole('status')).toContainText('cancelled');
  await expect(editor).toContainText('while (true)');
  await editor.fill(
    'document.querySelector("h1").textContent = "After cancel";',
  );
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  const child = page
    .frameLocator('iframe[title="Isolated interactive preview"]')
    .frameLocator('iframe[title="Interactive learner page"]');
  await expect(
    child.getByRole('heading', { name: 'After cancel' }),
  ).toBeVisible();
});

test('Build controls remain operable at narrow widths', async ({ page }) => {
  await createBuild(page);
  const htmlTab = page.getByRole('tab', { name: 'index.html' });
  await htmlTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'style.css' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tab', { name: 'style.css' })).toBeFocused();
  await page.getByRole('button', { name: 'Run Build' }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page
      .getByRole('region', { name: 'Interactive result' })
      .getByRole('status'),
  ).toContainText('ready');
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await expect(page.getByRole('button', { name: 'Run Build' })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test('leaving an active Build releases its display and a fresh visit recovers', async ({
  page,
}) => {
  const buildUrl = await createBuild(page);
  await page.getByRole('tab', { name: 'index.html' }).click();
  await page
    .getByRole('textbox', { name: 'index.html code editor (html)' })
    .fill('<h1 id="title">Safe</h1><button id="go">Go</button>');
  await page.getByRole('tab', { name: 'main.js' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill(
    'document.getElementById("go").addEventListener("click", () => { while (true) {} });',
  );
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({
    timeout: 10_000,
  });
  const panel = page.getByRole('region', { name: 'Interactive result' });
  await panel.getByRole('button', { name: 'Run Build' }).click();
  await expect(panel.getByRole('status')).toContainText('ready');
  const child = page
    .frameLocator('iframe[title="Isolated interactive preview"]')
    .frameLocator('iframe[title="Interactive learner page"]');
  await child.getByRole('button', { name: 'Go' }).click();
  await page.getByRole('link', { name: 'All Builds' }).click();
  await expect(
    page.locator('iframe[title="Isolated interactive preview"]'),
  ).toHaveCount(0);
  await page.goto(buildUrl, { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
  ).toContainText('while (true)');
  await page
    .getByRole('textbox', { name: 'main.js code editor (javascript)' })
    .fill('document.getElementById("title").textContent = "Fresh visit";');
  await page
    .getByRole('region', { name: 'Interactive result' })
    .getByRole('button', { name: 'Run Build' })
    .click();
  await expect(
    page
      .getByRole('region', { name: 'Interactive result' })
      .getByRole('status'),
  ).toContainText('ready', { timeout: 5_000 });
  await expect(
    child.getByRole('heading', { name: 'Fresh visit' }),
  ).toBeVisible();
});

test('local Build data stays isolated when the browser account changes', async ({
  page,
  context,
}) => {
  const guestBuild = await createBuild(page);
  await selectLocalOwner(context, 'account-a');
  await page.goto('/builds', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Account · this device')).toBeVisible();
  await expect(page.getByText('No Builds on this device yet.')).toBeVisible();
  await page.goto(guestBuild, { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByText('This Build is not available in this local owner scope.'),
  ).toBeVisible();
  await page.goto('/builds', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'New Build' }).click();
  await expect(
    page.getByRole('region', { name: 'Build workspace' }),
  ).toBeVisible();
  await selectLocalOwner(context, 'account-b');
  await page.reload();
  await expect(
    page.getByText('This Build is not available in this local owner scope.'),
  ).toBeVisible();
});

test('failed local save keeps the source editable and blocks in-app exit until retry', async ({
  page,
}) => {
  await createBuild(page);
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    Object.defineProperty(window, '__restoreBuildStorage', {
      value: () => {
        IDBObjectStore.prototype.put = original;
      },
    });
    IDBObjectStore.prototype.put = function (
      ...arguments_
    ): IDBRequest<IDBValidKey> {
      if (this.name === 'drafts')
        throw new DOMException(
          'Synthetic storage failure',
          'QuotaExceededError',
        );
      return original.apply(this, arguments_);
    };
  });
  await page.getByRole('tab', { name: 'main.js' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill('console.log("keep my source");');
  await expect(page.locator('[data-save-status="failed"]')).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole('link', { name: 'All Builds' }).click();
  await expect(
    page.getByText(
      'Your latest edits are only in memory. Retry Save before leaving this Build.',
    ),
  ).toBeVisible();
  await expect(editor).toContainText('keep my source');
  await page.evaluate(() => {
    const restore = Reflect.get(window, '__restoreBuildStorage') as
      (() => void) | undefined;
    restore?.();
  });
  await page.getByRole('button', { name: 'Save locally' }).click();
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({
    timeout: 10_000,
  });
  await page.getByRole('link', { name: 'All Builds' }).click();
  await expect(page).toHaveURL('/builds');
});

test('incompatible stored Build is hidden without erasing its draft', async ({
  page,
}) => {
  const buildUrl = await createBuild(page);
  const buildId = buildUrl.split('/').at(-1);
  if (!buildId) throw new Error('Build URL did not contain an ID');
  await page.getByRole('tab', { name: 'main.js' }).click();
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.fill('console.log("recoverable source");');
  await expect(page.locator('[data-save-status="saved"]')).toBeVisible({
    timeout: 10_000,
  });
  await page.evaluate(async (id) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('codequest');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('builds', 'readwrite');
        const store = transaction.objectStore('builds');
        const read = store.get(id);
        read.onsuccess = () => {
          const record = read.result as Record<string, unknown>;
          store.put({ ...record, manifestVersion: 99 });
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally {
      db.close();
    }
  }, buildId);
  await page.reload();
  await expect(
    page.getByText(
      'This Build could not be opened. Its stored files were not removed.',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Build workspace' }),
  ).toHaveCount(0);
  await page.evaluate(async (id) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('codequest');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('builds', 'readwrite');
        const store = transaction.objectStore('builds');
        const read = store.get(id);
        read.onsuccess = () => {
          const record = read.result as Record<string, unknown>;
          store.put({ ...record, manifestVersion: 1 });
        };
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally {
      db.close();
    }
  }, buildId);
  await page.getByRole('button', { name: 'Retry local storage' }).click();
  await expect(
    page.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
  ).toContainText('recoverable source');
});
