import { expect, test, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

async function control(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
}
async function cachedUrls(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const urls: string[] = [];
    for (const name of await caches.keys()) {
      for (const request of await (await caches.open(name)).keys())
        urls.push(request.url);
    }
    return urls;
  });
}
test('public installation and offline shell preserve cache and origin boundaries', async ({
  page,
  context,
  request,
}) => {
  await control(page);
  const manifest = await request.get('/manifest.webmanifest');
  expect(manifest.status()).toBe(200);
  expect(await manifest.json()).toMatchObject({
    display: 'standalone',
    start_url: '/',
    scope: '/',
  });
  expect((await request.get('/sw.js')).headers()['cache-control']).toContain(
    'no-store',
  );
  for (const host of ['localhost:3200', '127.0.0.2:3200']) {
    expect((await request.get('/sw.js', { headers: { host } })).status()).toBe(
      404,
    );
    expect(
      (await request.get('/offline.html', { headers: { host } })).status(),
    ).toBe(404);
  }
  await page.evaluate(async () => {
    for (const path of [
      '/api/v1/account/me',
      '/account',
      '/? _rsc=fixture',
      '/offline.html?token=fixture',
    ]) {
      await fetch(path.replace(' ', ''), {
        headers: { authorization: 'Bearer fixture', rsc: '1' },
      });
    }
    navigator.serviceWorker.controller?.postMessage({
      type: 'CACHE_URLS',
      payload: { urlsToCache: ['/account', '/auth/callback?code=fixture'] },
    });
  });
  const urls = await cachedUrls(page);
  expect(urls.some((url) => new URL(url).pathname === '/offline.html')).toBe(
    true,
  );
  expect(
    urls.every((url) => {
      const path = new URL(url).pathname;
      return (
        path === '/offline.html' ||
        path === '/offline.css' ||
        path.startsWith('/icons/') ||
        path.startsWith('/_next/static/')
      );
    }),
  ).toBe(true);
  expect(urls.join(' ')).not.toContain('fixture');
  // Public application JS may include a route name; response URLs must remain static.
  expect(
    urls.some((value) =>
      /^\/(?:account|auth|api|runtime|preview)(?:\/|$)/.test(
        new URL(value).pathname,
      ),
    ),
  ).toBe(false);
  await context.setOffline(true);
  await expect(page.getByText(/Offline · account services/)).toBeVisible();
  await page.goto('/account');
  await expect(
    page.getByRole('heading', { name: 'You’re offline' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Try CodeQuest again' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Try CodeQuest again' }).focus();
  await expect(
    page.getByRole('link', { name: 'Try CodeQuest again' }),
  ).toBeFocused();
  await expect(page.locator('body')).not.toContainText('fixture');
  const data = await page.evaluate(async () => {
    try {
      await fetch('/api/v1/account/me');
      return 'unexpected success';
    } catch {
      return 'network failure';
    }
  });
  expect(data).toBe('network failure');
  await context.setOffline(false);
});

test('new release waits without reload or deleting device-local work', async ({
  page,
}) => {
  await control(page);
  const identity = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const opening = indexedDB.open('codequest', 3);
      opening.onupgradeneeded = () => {
        const db = opening.result;
        if (!db.objectStoreNames.contains('drafts'))
          db.createObjectStore('drafts', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('outbox'))
          db.createObjectStore('outbox', { keyPath: 'eventId' });
      };
      opening.onsuccess = () => resolve(opening.result);
      opening.onerror = () => reject(opening.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        ['drafts', 'outbox'],
        'readwrite',
      );
      transaction.objectStore('drafts').put({
        id: 'pwa-fixture-draft',
        ownerId: 'guest',
        workspaceId: 'fixture',
        fileId: 'main',
        source: 'preserved source',
        updatedAt: 1,
      });
      transaction.objectStore('outbox').put({
        eventId: 'pwa-fixture-event',
        ownerId: 'guest',
        questId: 'fixture',
        contentVersion: 1,
        payload: 'preserved pending',
        createdAt: 1,
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
    const editor = document.createElement('textarea');
    editor.setAttribute('aria-label', 'Unsaved update fixture');
    editor.value = 'unsaved in-memory source';
    document.body.append(editor);
    return navigator.serviceWorker.controller?.scriptURL;
  });
  // A byte-different real worker at the same URL models the next deployment.
  const original = await readFile('public/sw.js', 'utf8');
  try {
    await writeFile(
      'public/sw.js',
      original + '\n/* production update fixture */\n',
    );
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    });
    await expect(page.getByText(/Update available/)).toBeVisible();
    await page.evaluate(() => {
      navigator.serviceWorker
        .getRegistration()
        .then((registration) =>
          registration?.waiting?.postMessage({ type: 'SKIP_WAITING' }),
        );
    });
    await expect
      .poll(() =>
        page.evaluate(
          async () =>
            (await navigator.serviceWorker.getRegistration())?.waiting?.state,
        ),
      )
      .toBe('installed');
    expect(
      await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL),
    ).toBe(identity);
    await expect(
      page.getByRole('heading', { name: 'CodeQuest', exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel('Unsaved update fixture')).toHaveValue(
      'unsaved in-memory source',
    );
    const records = await page.evaluate(async () => {
      const database = await new Promise<IDBDatabase>((resolve) => {
        const opening = indexedDB.open('codequest');
        opening.onsuccess = () => resolve(opening.result);
      });
      const values: unknown[] = [];
      for (const [store, key] of [
        ['drafts', 'pwa-fixture-draft'],
        ['outbox', 'pwa-fixture-event'],
      ]) {
        values.push(
          await new Promise<unknown>((resolve) => {
            const lookup = database
              .transaction(store)
              .objectStore(store)
              .get(key);
            lookup.onsuccess = () => resolve(lookup.result);
          }),
        );
      }
      database.close();
      return values;
    });
    expect(records).toMatchObject([
      { source: 'preserved source' },
      { payload: 'preserved pending' },
    ]);
  } finally {
    await writeFile('public/sw.js', original);
  }
});
