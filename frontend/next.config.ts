import type { NextConfig } from 'next';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import withSerwistInit from '@serwist/next';
import {
  assertShellBudget,
  isPublicShellUrl,
  SHELL_ASSETS,
} from './src/pwa/cache-policy';

const bootstrapPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "worker-src 'self'",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const workerPolicy = [
  "default-src 'none'",
  "script-src 'unsafe-eval'",
  "worker-src 'none'",
  "connect-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
].join('; ');

const previewPolicy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'unsafe-inline'",
  'img-src data:',
  "connect-src 'none'",
  "frame-src 'self'",
  "worker-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function frameOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      return null;
    if (
      url.protocol !== 'https:' &&
      !(
        url.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '127.0.0.2', '[::1]'].includes(url.hostname)
      )
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}

const permittedFrames = [
  process.env.NEXT_PUBLIC_RUNTIME_ORIGIN,
  process.env.NEXT_PUBLIC_PREVIEW_ORIGIN,
]
  .map(frameOrigin)
  .filter((value): value is string => value !== null)
  .join(' ');

const nextConfig: NextConfig = {
  distDir:
    process.env.CODEQUEST_PREVIEW_BUILD === '1' ? '.next-preview' : '.next',
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; script-src 'self'; connect-src 'self'",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/offline.html',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/editor-workspace',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-src ${permittedFrames || "'none'"}`,
          },
        ],
      },
      {
        source: '/preview/bootstrap.html',
        headers: [
          { key: 'Content-Security-Policy', value: previewPolicy },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/preview/bootstrap.js',
        headers: [
          { key: 'Content-Security-Policy', value: previewPolicy },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/runtime/bootstrap.html',
        headers: [
          { key: 'Content-Security-Policy', value: bootstrapPolicy },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/runtime/bootstrap.js',
        headers: [
          { key: 'Content-Security-Policy', value: bootstrapPolicy },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        source: '/runtime/javascript-worker.js',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: workerPolicy,
          },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      ...[
        '/runtime/validation-bootstrap.html',
        '/runtime/validation-bootstrap.js',
      ].map((source) => ({
        source,
        headers: [
          { key: 'Content-Security-Policy', value: bootstrapPolicy },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      })),
      {
        source: '/runtime/validation-worker.js',
        headers: [
          { key: 'Content-Security-Policy', value: workerPolicy },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

const pwaEnabled =
  process.env.NODE_ENV === 'production' &&
  process.env.CODEQUEST_PREVIEW_BUILD !== '1';
const publicEntry = (url: string) => {
  const file = path.join(process.cwd(), 'public', url);
  return {
    url,
    revision: createHash('sha256').update(readFileSync(file)).digest('hex'),
  };
};
const withSerwist = withSerwistInit({
  swSrc: 'src/pwa/sw.ts',
  swDest: 'public/sw.js',
  register: false,
  reloadOnOnline: false,
  cacheOnNavigation: false,
  disable: !pwaEnabled,
  additionalPrecacheEntries: pwaEnabled ? SHELL_ASSETS.map(publicEntry) : [],
  // Enforce both limits ourselves rather than silently dropping large assets.
  maximumFileSizeToCacheInBytes: Number.MAX_SAFE_INTEGER,
  manifestTransforms: [
    async (entries) => {
      const manifest = entries.filter((entry) => isPublicShellUrl(entry.url));
      assertShellBudget(
        manifest.map((entry) => ({
          size: SHELL_ASSETS.some((url) => url === entry.url)
            ? statSync(path.join(process.cwd(), 'public', entry.url)).size
            : entry.size,
        })),
      );
      return { manifest, warnings: [] };
    },
  ],
});

export default withSerwist(nextConfig);
