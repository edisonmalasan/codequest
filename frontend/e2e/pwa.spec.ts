import { expect, test, type Page } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { questFixtures } from '../src/features/curriculum/journey-course-test-data';

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
        path === '/offline-learning' ||
        path === '/offline.css' ||
        path === '/assets/design-system/brand/codequest-mark.svg' ||
        path.startsWith('/icons/') ||
        path.startsWith('/_next/static/')
      );
    }),
  ).toBe(true);
  expect(urls.join(' ')).not.toContain('fixture');
  const offlineDocument = await request.get('/offline-learning', {
    headers: { cookie: 'sb-auth-fixture=must-not-enter-public-shell' },
  });
  expect(offlineDocument.headers()['set-cookie']).toBeUndefined();
  expect(await offlineDocument.text()).not.toContain(
    'must-not-enter-public-shell',
  );
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

test('dedicated runner setup and static learning route survive a cold offline navigation', async ({
  page,
  context,
}) => {
  await control(page);
  const setup = await page.evaluate(async () => {
    const setupId = crypto.randomUUID();
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.sandbox.add('allow-scripts', 'allow-same-origin');
    frame.src = `http://localhost:3200/runtime/offline-setup.html?parentOrigin=${encodeURIComponent(location.origin)}#${setupId}`;
    document.body.append(frame);
    return new Promise<string>((resolve) => {
      const timeout = setTimeout(() => resolve('timeout'), 10000);
      window.addEventListener('message', function receive(event) {
        if (
          event.source !== frame.contentWindow ||
          event.origin !== 'http://localhost:3200' ||
          event.data?.type !== 'offline-runner-setup' ||
          event.data?.setupId !== setupId
        )
          return;
        clearTimeout(timeout);
        window.removeEventListener('message', receive);
        frame.remove();
        resolve(event.data.status);
      });
    });
  });
  expect(setup).toBe('ready');
  await page.close();
  await context.setOffline(true);
  const offlinePage = await context.newPage();
  await offlinePage.goto('/offline-learning');
  await expect(
    offlinePage.getByRole('heading', { name: 'Downloaded lessons' }),
  ).toBeVisible();
  const result = await offlinePage.evaluate(async () => {
    const bootstrapId = crypto.randomUUID();
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.sandbox.add('allow-scripts', 'allow-same-origin');
    frame.src = `http://localhost:3200/runtime/bootstrap.html?parentOrigin=${encodeURIComponent(location.origin)}#${bootstrapId}`;
    document.body.append(frame);
    return new Promise<string>((resolve) => {
      const timeout = setTimeout(() => resolve('timeout'), 10000);
      const statuses: string[] = [];
      let startedAt = 0;
      window.addEventListener('message', function receive(event) {
        if (
          event.source !== frame.contentWindow ||
          event.origin !== 'http://localhost:3200' ||
          event.data?.type !== 'bootstrap-ready' ||
          event.data?.bootstrapId !== bootstrapId
        )
          return;
        clearTimeout(timeout);
        window.removeEventListener('message', receive);
        const channel = new MessageChannel();
        channel.port1.onmessage = ({ data }) => {
          if (data?.type === 'connected') {
            startedAt = performance.now();
            channel.port1.postMessage({
              type: 'execute',
              runId: crypto.randomUUID(),
              source: 'while (true) {}',
            });
          } else if (data?.type === 'result') {
            statuses.push(data.status);
            if (statuses.length === 1) {
              if (performance.now() - startedAt > 3000) {
                resolve('loop recovery too slow');
                return;
              }
              startedAt = performance.now();
              channel.port1.postMessage({
                type: 'execute',
                runId: crypto.randomUUID(),
                source: 'return 42',
              });
            } else {
              if (performance.now() - startedAt > 1000) {
                resolve('finite recovery too slow');
                return;
              }
              clearTimeout(timeout);
              frame.remove();
              channel.port1.close();
              resolve(`${statuses.join(',')}:${data.value}`);
            }
          }
        };
        channel.port1.start();
        frame.contentWindow?.postMessage(
          { type: 'connect', bootstrapId },
          'http://localhost:3200',
          [channel.port2],
        );
      });
    });
  });
  expect(result).toBe('timeout,success:42');
  await context.setOffline(false);
});

test('explicit download opens offline with local Run Check and retained draft', async ({
  page,
  context,
}) => {
  const quest = {
    ...questFixtures.Q01,
    lesson: '# Offline fixture\n\nRead the downloaded instructions.',
    starterCode: 'console.log(1);',
  };
  await context.route(
    'http://127.0.0.1:3001/api/v1/quests/first-value',
    (route) =>
      route.fulfill({
        json: quest,
        headers: { 'access-control-allow-origin': '*' },
      }),
  );
  await control(page);
  await page.goto('/quests/first-value');
  await page
    .getByRole('button', { name: 'Download lesson', exact: true })
    .click();
  await expect(
    page.getByText(/Saved for offline reading and local Run and Check/),
  ).toBeVisible({ timeout: 20000 });
  await page.close();
  await context.setOffline(true);
  const offline = await context.newPage();
  await offline.goto('/offline-learning');
  await offline.getByRole('button', { name: 'Open saved lesson' }).click();
  await expect(
    offline.getByText('Read the downloaded instructions.'),
  ).toBeVisible();
  const editor = offline.getByRole('textbox', {
    name: 'main.js code editor (javascript)',
  });
  await expect(editor).toBeVisible();
  await offline.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(offline.getByText(/Completed in .* seconds/)).toBeVisible();
  await offline.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(offline.getByText(/Local check passed/)).toBeVisible();
  await expect(
    offline.getByRole('button', { name: 'Submit', exact: true }),
  ).toHaveCount(0);
  await editor.click();
  await offline.keyboard.press('Control+A');
  await offline.keyboard.insertText("console.log('retained offline source');");
  await expect(editor).toContainText('retained offline source');
  await expect
    .poll(() =>
      offline.evaluate(async () => {
        const database = await new Promise<IDBDatabase>((resolve, reject) => {
          const opening = indexedDB.open('codequest');
          opening.onsuccess = () => resolve(opening.result);
          opening.onerror = () => reject(opening.error);
        });
        try {
          return await new Promise<string | null>((resolve, reject) => {
            const read = database
              .transaction('drafts')
              .objectStore('drafts')
              .get('guest:Q01-1.0.0:main');
            read.onsuccess = () => {
              const record: unknown = read.result;
              resolve(
                typeof record === 'object' &&
                  record !== null &&
                  'source' in record &&
                  typeof record.source === 'string'
                  ? record.source
                  : null,
              );
            };
            read.onerror = () => reject(read.error);
          });
        } finally {
          database.close();
        }
      }),
    )
    .toBe("console.log('retained offline source');");
  await expect(
    offline.getByText('Saved on this device', { exact: true }),
  ).toBeVisible();
  await offline.reload();
  await offline.getByRole('button', { name: 'Open saved lesson' }).click();
  await expect(
    offline.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
  ).toContainText('retained offline source');
  await offline.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(
    offline.getByText('retained offline source', { exact: true }),
  ).toBeVisible();
  const runtimeFrame = offline
    .frames()
    .find((frame) => frame.url().includes('/runtime/bootstrap.html'));
  expect(runtimeFrame).toBeDefined();
  await runtimeFrame?.evaluate(async () => {
    for (const name of await caches.keys())
      if (name.startsWith('codequest-runtime-')) await caches.delete(name);
  });
  await offline.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(
    offline.getByText('Runtime unavailable', { exact: true }),
  ).toBeVisible();
  await expect(
    offline.getByRole('textbox', { name: 'main.js code editor (javascript)' }),
  ).toContainText('retained offline source');
  const urls = await cachedUrls(offline);
  expect(
    urls.some((url) => url.includes('/api/') || url.includes('/quests/')),
  ).toBe(false);
  await context.setOffline(false);
  await offline.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(
    offline.getByText('retained offline source', { exact: true }),
  ).toBeVisible();
});

test('offline session buckets isolate downloads and last-known accepted facts', async ({
  page,
  context,
}) => {
  await control(page);
  await page.goto('/offline-learning');
  await expect(
    page.getByText('No lessons are downloaded for this local owner.'),
  ).toBeVisible();
  await page.evaluate(async (quest) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const opening = indexedDB.open('codequest');
      opening.onsuccess = () => resolve(opening.result);
      opening.onerror = () => reject(opening.error);
    });
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(
        ['lessonSnapshots', 'acceptedProgress'],
        'readwrite',
      );
      for (const owner of ['owner-a', 'owner-b']) {
        tx.objectStore('lessonSnapshots').put({
          id: `${owner}:${quest.id}:${quest.contentVersion}:${quest.assessmentVersion}`,
          ownerId: owner,
          questId: quest.id,
          contentVersion: quest.contentVersion,
          assessmentVersion: quest.assessmentVersion,
          snapshot: { ...quest, title: `${owner} lesson` },
          savedAt: 42,
          assetPaths: [],
        });
        tx.objectStore('acceptedProgress').put({
          id: `${owner}:${quest.hierarchy.journey.id}`,
          ownerId: owner,
          journeyId: quest.hierarchy.journey.id,
          capturedAt: 42,
          schemaVersion: 1,
          quests: [
            {
              questId: quest.id,
              contentVersion: quest.contentVersion,
              assessmentVersion: quest.assessmentVersion,
              status: owner === 'owner-a' ? 'completed' : 'not_started',
              availability: 'available',
            },
          ],
        });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    database.close();
  }, questFixtures.Q01);
  const selectLocalSession = async (owner: string) => {
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
        name: 'sb-auth-auth-token',
        value: `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}`,
        url: 'http://127.0.0.1:3200',
      },
    ]);
  };
  await context.setOffline(true);
  await selectLocalSession('owner-a');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'owner-a lesson' }),
  ).toBeVisible();
  await expect(
    page.getByText(/Last known accepted account status: completed/),
  ).toBeVisible();
  await selectLocalSession('owner-b');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'owner-b lesson' }),
  ).toBeVisible();
  await expect(
    page.getByText(/Last known accepted account status: not_started/),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'owner-a lesson' }),
  ).toHaveCount(0);
  await context.clearCookies();
  await page.reload();
  await expect(
    page.getByText('No lessons are downloaded for this local owner.'),
  ).toBeVisible();
  await context.setOffline(false);
});

test('new release waits without reload or deleting device-local work', async ({
  page,
}) => {
  await control(page);
  const identity = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const opening = indexedDB.open('codequest');
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
