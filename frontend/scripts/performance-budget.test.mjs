import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  budgetFailures,
  measure,
  precacheUrls,
  routeEntries,
} from './performance-budget.mjs';

test('missing build manifest and routes fail closed', () => {
  assert.throws(
    () =>
      measure('/missing', {
        read: () => {
          throw new Error('missing');
        },
      }),
    /Build frontend before/,
  );
  assert.throws(
    () => routeEntries({ pages: {} }, '/quests/[slug]/page'),
    /Missing or invalid/,
  );
});

test('generated precache URLs must include both offline documents', () => {
  assert.deepEqual(
    precacheUrls(
      "[{'revision':'x','url':'/offline.html'},{'revision':null,'url':'/offline-learning'}]",
    ),
    ['/offline.html', '/offline-learning'],
  );
  assert.throws(
    () => precacheUrls("[{'revision':null,'url':'/offline.html'}]"),
    /missing or unsupported/,
  );
});

test('byte budgets name oversized routes, assets, and shell entries', () => {
  const report = {
    routes: {
      home: { bytes: 400_001 },
      journey: { bytes: 1 },
      quest: { bytes: 1 },
      offline: { bytes: 1 },
    },
    assets: {
      'assets/design-system/fonts/pixelify-sans.ttf': 100_001,
      'assets/design-system/worlds/foundations-valley.webp': 1,
    },
    precache: [{ url: '/offline.html', bytes: 2 * 1024 * 1024 + 1 }],
    precacheBytes: 12 * 1024 * 1024 + 1,
  };
  assert.deepEqual(budgetFailures(report), [
    'route home: 400001 bytes exceeds 400000',
    'asset assets/design-system/fonts/pixelify-sans.ttf: 100001 bytes exceeds 100000',
    'precache /offline.html: 2097153 bytes exceeds 2097152',
    'precache total: 12582913 bytes exceeds 12582912',
    'performance precache total: 12582913 bytes exceeds 3500000',
  ]);
});
