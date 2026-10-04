import { expect, test } from '@playwright/test';
import { appOrigin, previewOrigin, runtimeOrigin } from './test-origins';

test('interactive Worker updates an opaque preview through bounded events', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive web preview' });
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
    (
      await page.request.get(`${runtimeOrigin}/preview/interactive-bridge.js`)
    ).status(),
  ).toBe(404);
});

test('hostile source times out and a finite run recovers without losing the draft', async ({
  page,
}) => {
  await page.goto('/editor-workspace');
  const panel = page.getByRole('region', { name: 'Interactive web preview' });
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
  const started = Date.now();
  await panel.getByRole('button', { name: 'Start interactive' }).click();
  await expect(panel.getByRole('status')).toContainText('ready', {
    timeout: 5_000,
  });
  expect(Date.now() - started).toBeLessThan(1_000);
  const child = page
    .frameLocator('iframe[title="Isolated interactive preview"]')
    .frameLocator('iframe[title="Interactive learner page"]');
  await expect(child.getByRole('heading', { name: 'Recovered' })).toBeVisible();
});
