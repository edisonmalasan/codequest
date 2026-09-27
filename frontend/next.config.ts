import type { NextConfig } from 'next';

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
    ];
  },
};

export default nextConfig;
