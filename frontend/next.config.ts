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

const nextConfig: NextConfig = {
  async headers() {
    return [
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
