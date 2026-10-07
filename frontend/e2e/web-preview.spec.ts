import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { appOrigin, previewOrigin, runtimeOrigin } from './test-origins';

test('static preview filters active content, preserves source, and isolates Worker output', async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route('**/forbidden-preview-sink', async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ status: 204 });
  });
  await page.goto('/editor-workspace');
  const preview = page.getByRole('region', { name: 'Web preview' });
  await page
    .getByRole('heading', { name: 'Editor Workspace' })
    .scrollIntoViewIfNeeded();
  const htmlTab = page.getByRole('tab', { name: 'index.html' });
  await htmlTab.click();
  const htmlEditor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await htmlEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '<main><h1>Safe title</h1><a href="/forbidden-preview-sink">Unsafe link</a><script>fetch("/forbidden-preview-sink")</script><img src="/forbidden-preview-sink" onerror="alert(1)"></main>',
  );
  await page.getByRole('tab', { name: 'styles.css' }).click();
  const cssEditor = page.getByRole('textbox', {
    name: 'styles.css code editor (css)',
  });
  await cssEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    "@import url('/forbidden-preview-sink'); h1 { color: rgb(0, 128, 0); background-image: url('/forbidden-preview-sink'); }",
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(preview.getByRole('status')).toContainText(
    'Static preview ready',
  );
  await expect(
    preview.getByText('Active HTML content was removed'),
  ).toBeVisible();
  const shell = page.frameLocator(
    'iframe[title="Static HTML and CSS preview"]',
  );
  const child = shell.frameLocator(
    'iframe[title="Static learner HTML and CSS preview"]',
  );
  await expect(
    child.getByRole('heading', { name: 'Safe title' }),
  ).toBeVisible();
  expect(
    await child
      .getByRole('heading', { name: 'Safe title' })
      .evaluate((element) => getComputedStyle(element).color),
  ).toBe('rgb(0, 128, 0)');
  await expect(child.getByText('Unsafe link')).toBeVisible();
  await expect(shell.locator('iframe')).toHaveAttribute('sandbox', '');
  expect(await child.locator('body').evaluate(() => location.origin)).toBe(
    'null',
  );
  expect(requests).toEqual([]);

  const bootstrap = await page.request.get(
    `${previewOrigin}/preview/bootstrap.html`,
  );
  expect(bootstrap.headers()['content-security-policy']).toContain(
    "connect-src 'none'",
  );
  expect(bootstrap.headers()['content-security-policy']).toContain(
    "frame-src 'self'",
  );
  expect(bootstrap.headers()['referrer-policy']).toBe('no-referrer');
  const appResponse = await page.request.get(`${appOrigin}/editor-workspace`);
  expect(appResponse.headers()['content-security-policy']).toContain(
    `frame-src ${runtimeOrigin} ${previewOrigin}`,
  );
  expect(
    (await page.request.get(`${appOrigin}/preview/bootstrap.html`)).status(),
  ).toBe(404);
  expect((await page.request.get(`${previewOrigin}/login`)).status()).toBe(404);
  expect(
    (
      await page.request.get(`${previewOrigin}/runtime/bootstrap.html`)
    ).status(),
  ).toBe(404);

  await page.getByRole('tab', { name: 'main.js' }).click();
  const jsEditor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await jsEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    "console.log(typeof document, typeof fetch); return 'worker-ok';",
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(preview.getByText('undefined undefined')).toBeVisible();
  await expect(
    child.getByRole('heading', { name: 'Safe title' }),
  ).toBeVisible();
  for (let reload = 0; reload < 3; reload += 1) {
    await page.getByRole('button', { name: 'Reload preview' }).click();
    await expect(preview.getByRole('status')).toContainText(
      'Static preview ready',
    );
    await expect(shell.locator('iframe')).toHaveCount(1);
  }
  await htmlTab.click();
  await expect(htmlEditor).toContainText('Safe title');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 780, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '200%';
  });
  await expect(
    page.getByRole('button', { name: 'Preview', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('preview Worker recovers after a loop and remains independent of Run', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  await page
    .getByRole('heading', { name: 'Editor Workspace' })
    .scrollIntoViewIfNeeded();
  const preview = page.getByRole('region', { name: 'Web preview' });
  const editor = page.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('while (true) {}');
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(preview.getByRole('status')).toContainText('timed out', {
    timeout: 5_000,
  });
  await expect(editor).toContainText('while (true)');

  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText("console.log('fresh-preview');");
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(preview.getByText('fresh-preview')).toBeVisible();
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(
    page.getByText('fresh-preview', { exact: true }).last(),
  ).toBeVisible();
});

test('static preview switches named widths without losing the source or overflowing the page', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  await page
    .getByRole('heading', { name: 'Editor Workspace' })
    .scrollIntoViewIfNeeded();
  await page.getByRole('tab', { name: 'index.html' }).click();
  const htmlEditor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await htmlEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '<main><h1>Responsive field guide</h1></main>',
  );
  await page.getByRole('tab', { name: 'styles.css' }).click();
  const cssEditor = page.getByRole('textbox', {
    name: 'styles.css code editor (css)',
  });
  await cssEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    'h1 { color: blue; } @media (max-width: 600px) { h1 { color: red; } }',
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = page.getByRole('region', { name: 'Web preview' });
  await expect(preview.getByRole('status')).toContainText(
    'Static preview ready',
  );
  const shell = page.frameLocator(
    'iframe[title="Static HTML and CSS preview"]',
  );
  const child = shell.frameLocator(
    'iframe[title="Static learner HTML and CSS preview"]',
  );
  const heading = child.getByRole('heading', {
    name: 'Responsive field guide',
  });
  const color = () =>
    heading.evaluate((element) => getComputedStyle(element).color);

  const narrow = preview.getByRole('button', { name: 'Narrow · 390px' });
  const wide = preview.getByRole('button', { name: 'Wide · 1024px' });
  const current = preview.getByRole('button', { name: 'Current' });
  await expect(current).toHaveAttribute('aria-pressed', 'true');
  await wide.click();
  await expect(wide).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(color).toBe('rgb(0, 0, 255)');
  await narrow.click();
  await expect(narrow).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(color).toBe('rgb(255, 0, 0)');
  await expect(shell.locator('iframe')).toHaveCount(1);
  await expect(cssEditor).toContainText('@media (max-width: 600px)');

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await current.click();
  await expect(current).toHaveAttribute('aria-pressed', 'true');
  await expect(heading).toBeVisible();
});

test('inert form and link preview cannot submit or navigate', async ({
  page,
}) => {
  const sinks: string[] = [];
  await page.route('**/forbidden-preview-sink', async (route) => {
    sinks.push(route.request().url());
    await route.fulfill({ status: 204 });
  });
  await page.goto('/editor-workspace');
  await page
    .getByRole('heading', { name: 'Editor Workspace' })
    .scrollIntoViewIfNeeded();
  const editor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await page.getByRole('tab', { name: 'index.html' }).click();
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '<main><h1 id="safe">Field guide</h1><a href="/forbidden-preview-sink">Outside</a><a href="#safe">Inside</a><form action="/forbidden-preview-sink" method="post"><fieldset><legend>Search</legend><label for="query">Query</label><input id="query" name="query" type="search"><button type="submit">Send</button></fieldset></form><script>fetch("/forbidden-preview-sink")</script></main>',
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = page.getByRole('region', { name: 'Web preview' });
  await expect(preview.getByRole('status')).toContainText(
    'Static preview ready',
  );
  const shell = page.frameLocator(
    'iframe[title="Static HTML and CSS preview"]',
  );
  const child = shell.frameLocator(
    'iframe[title="Static learner HTML and CSS preview"]',
  );
  await expect(
    child.getByRole('heading', { name: 'Field guide' }),
  ).toBeVisible();
  await expect(child.locator('input#query')).toBeVisible();
  expect(await child.locator('form').getAttribute('action')).toBeNull();
  expect(await child.getByText('Outside').getAttribute('href')).toBeNull();
  expect(await child.getByText('Inside').getAttribute('href')).toBeNull();
  expect(await child.locator('script').count()).toBe(0);
  await child.getByRole('button', { name: 'Send' }).click();
  await child.getByText('Outside').click();
  await child.getByText('Inside').click();
  await child.locator('body').evaluate(() => {
    parent.postMessage(
      { type: 'bootstrap-ready', bootstrapId: 'forged-preview' },
      '*',
    );
    parent.postMessage({ type: 'ready', generationId: 'forged-preview' }, '*');
  });
  await expect(preview.getByRole('status')).toContainText(
    'Static preview ready',
  );
  await expect(
    child.getByRole('heading', { name: 'Field guide' }),
  ).toBeVisible();
  expect(page.url()).toContain('/editor-workspace');
  expect(await shell.locator('iframe').getAttribute('sandbox')).toBe('');
  expect(await child.locator('body').evaluate(() => location.origin)).toBe(
    'null',
  );
  expect(
    await child.locator('body').evaluate(() => {
      try {
        localStorage.setItem('forged-preview', '1');
        return false;
      } catch {
        return true;
      }
    }),
  ).toBe(true);
  expect(sinks).toEqual([]);
  await expect(editor).toContainText('forbidden-preview-sink');
});

test('authored local route image displays with its text alternative and no remote source', async ({
  page,
}) => {
  const starter = readFileSync(
    resolve(
      process.cwd(),
      '../backend/content/journeys/web-foundations/courses/html-foundations/chapters/ways-through-content/quests/images-with-meaning/versions/1.0.0/starter.html',
    ),
    'utf8',
  );
  const source = starter.replace(
    'alt=""',
    'alt="Map showing the river crossing"',
  );
  await page.goto('/editor-workspace');
  await page
    .getByRole('heading', { name: 'Editor Workspace' })
    .scrollIntoViewIfNeeded();
  await page.getByRole('tab', { name: 'index.html' }).click();
  const editor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await editor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(source);
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = page.getByRole('region', { name: 'Web preview' });
  await expect(preview.getByRole('status')).toContainText(
    'Static preview ready',
  );
  const child = page
    .frameLocator('iframe[title="Static HTML and CSS preview"]')
    .frameLocator('iframe[title="Static learner HTML and CSS preview"]');
  const image = child.getByRole('img', {
    name: 'Map showing the river crossing',
  });
  await expect(image).toBeVisible();
  expect(await image.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
  expect(
    await image.evaluate(
      (element) => (element as HTMLImageElement).naturalWidth,
    ),
  ).toBe(16);
});

test('authored CSS field guide changes its grid between narrow and wide Preview', async ({
  page,
}) => {
  const starter = readFileSync(
    resolve(
      process.cwd(),
      '../backend/content/journeys/web-foundations/courses/css-foundations/chapters/responsive-pages/quests/finish-the-field-guide/versions/1.0.0/starter.html',
    ),
    'utf8',
  );
  await page.goto('/editor-workspace');
  await page
    .getByRole('heading', { name: 'Editor Workspace' })
    .scrollIntoViewIfNeeded();
  await page.getByRole('tab', { name: 'index.html' }).click();
  const htmlEditor = page.getByRole('textbox', {
    name: 'index.html code editor (html)',
  });
  await htmlEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(starter);
  await page.getByRole('tab', { name: 'styles.css' }).click();
  const cssEditor = page.getByRole('textbox', {
    name: 'styles.css code editor (css)',
  });
  await cssEditor.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(
    '.field-guide { max-width: 64rem; padding: 1rem; } .guide-stops { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; } @media (max-width: 600px) { .guide-stops { grid-template-columns: 1fr; } }',
  );
  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  const preview = page.getByRole('region', { name: 'Web preview' });
  await expect(preview.getByRole('status')).toContainText(
    'Static preview ready',
  );
  const stops = page
    .frameLocator('iframe[title="Static HTML and CSS preview"]')
    .frameLocator('iframe[title="Static learner HTML and CSS preview"]')
    .locator('.guide-stops');
  const trackCount = () =>
    stops.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(/\s+/).length,
    );
  await preview.getByRole('button', { name: 'Narrow · 390px' }).click();
  await expect.poll(trackCount).toBe(1);
  await preview.getByRole('button', { name: 'Wide · 1024px' }).click();
  await expect.poll(trackCount).toBe(2);
  await expect(cssEditor).toContainText('@media (max-width: 600px)');
});
