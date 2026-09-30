import { readFileSync, statSync } from 'node:fs';
import console from 'node:console';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

export const ROUTES = {
  home: '/page',
  journey: '/journeys/[slug]/page',
  quest: '/quests/[slug]/page',
  offline: '/offline-learning/page',
};

export const ROUTE_LIMITS = {
  home: 400_000,
  journey: 950_000,
  quest: 1_200_000,
  offline: 1_225_000,
};

export const ASSET_LIMITS = {
  'assets/design-system/fonts/pixelify-sans.ttf': 100_000,
  'assets/design-system/worlds/foundations-valley.webp': 250_000,
};

export function routeEntries(manifest, route) {
  const entries = manifest?.pages?.[route];
  if (
    !Array.isArray(entries) ||
    entries.length === 0 ||
    entries.some((entry) => typeof entry !== 'string')
  ) {
    throw new Error(`Missing or invalid app-build manifest route: ${route}`);
  }
  return entries;
}

export function precacheUrls(workerSource) {
  const urls = [
    ...workerSource.matchAll(
      /\{'revision':(?:null|'[^']*'),'url':'([^']+)'\}/g,
    ),
  ].map((match) => match[1]);
  if (
    urls.length === 0 ||
    !urls.includes('/offline-learning') ||
    !urls.includes('/offline.html')
  ) {
    throw new Error(
      'Generated service-worker precache manifest is missing or unsupported.',
    );
  }
  return [...new Set(urls)];
}

export function measure(
  root,
  { read = readFileSync, size = (path) => statSync(path).size } = {},
) {
  let manifest;
  try {
    manifest = JSON.parse(
      read(join(root, '.next/app-build-manifest.json'), 'utf8'),
    );
  } catch (error) {
    throw new Error(
      'Build frontend before checking performance bytes: app-build-manifest.json unavailable.',
      { cause: error },
    );
  }
  const routes = Object.fromEntries(
    Object.entries(ROUTES).map(([name, key]) => {
      const files = routeEntries(manifest, key).map((entry) => {
        const path = join(root, '.next', entry);
        const bytes = read(path);
        return {
          path: entry,
          bytes: bytes.byteLength,
          gzipBytes: gzipSync(bytes).byteLength,
        };
      });
      return [
        name,
        {
          files,
          bytes: files.reduce((total, file) => total + file.bytes, 0),
          gzipBytes: files.reduce((total, file) => total + file.gzipBytes, 0),
        },
      ];
    }),
  );
  const assets = Object.fromEntries(
    Object.keys(ASSET_LIMITS).map((asset) => [
      asset,
      size(join(root, 'public', asset)),
    ]),
  );
  const urls = precacheUrls(read(join(root, 'public/sw.js'), 'utf8'));
  const precache = urls.map((url) => {
    const path =
      url === '/offline-learning'
        ? join(root, '.next/server/app/offline-learning.html')
        : url.startsWith('/_next/')
          ? join(root, '.next', url.slice('/_next/'.length))
          : join(root, 'public', url.slice(1));
    return { url, bytes: size(path) };
  });
  return {
    routes,
    assets,
    precache,
    precacheBytes: precache.reduce((total, entry) => total + entry.bytes, 0),
  };
}

export function budgetFailures(report) {
  const failures = [];
  for (const [name, limit] of Object.entries(ROUTE_LIMITS)) {
    const bytes = report.routes[name]?.bytes;
    if (!Number.isFinite(bytes) || bytes > limit)
      failures.push(`route ${name}: ${bytes} bytes exceeds ${limit}`);
  }
  for (const [name, limit] of Object.entries(ASSET_LIMITS)) {
    const bytes = report.assets[name];
    if (!Number.isFinite(bytes) || bytes > limit)
      failures.push(`asset ${name}: ${bytes} bytes exceeds ${limit}`);
  }
  for (const { url, bytes } of report.precache) {
    if (bytes > 2 * 1024 * 1024)
      failures.push(`precache ${url}: ${bytes} bytes exceeds 2097152`);
  }
  if (report.precacheBytes > 12 * 1024 * 1024)
    failures.push(
      `precache total: ${report.precacheBytes} bytes exceeds 12582912`,
    );
  if (report.precacheBytes > 3_500_000)
    failures.push(
      `performance precache total: ${report.precacheBytes} bytes exceeds 3500000`,
    );
  return failures;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  try {
    const report = measure(process.cwd());
    for (const [name, route] of Object.entries(report.routes)) {
      console.log(
        `${name}: ${route.bytes} raw JS bytes, ${route.gzipBytes} gzip bytes`,
      );
      for (const file of route.files)
        console.log(
          `  ${file.path}: ${file.bytes} raw, ${file.gzipBytes} gzip`,
        );
    }
    for (const [path, bytes] of Object.entries(report.assets))
      console.log(`asset ${path}: ${bytes} bytes`);
    for (const { url, bytes } of report.precache)
      console.log(`precache ${url}: ${bytes} bytes`);
    console.log(`precache total: ${report.precacheBytes} bytes`);
    const failures = budgetFailures(report);
    if (failures.length > 0) {
      for (const failure of failures) console.error(failure);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
