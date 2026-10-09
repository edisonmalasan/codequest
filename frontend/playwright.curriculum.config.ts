import { defineConfig, devices } from '@playwright/test';
import pwa from './playwright.pwa.config';

export default defineConfig({
  ...pwa,
  testMatch: ['**/foundations.spec.ts', '**/capstone.spec.ts'],
  webServer: [
    {
      command: 'pnpm --dir ../backend start',
      url: 'http://127.0.0.1:3001/api/v1/journeys',
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: '3001',
        RATE_LIMIT_MAX: '1000',
        CORS_ORIGINS: 'http://127.0.0.1:3200',
        DATABASE_URL:
          'postgresql://codequest:local-fixture@127.0.0.1:5432/codequest_test',
        SUPABASE_AUTH_ISSUER: 'http://127.0.0.1:54321/auth/v1',
        SUPABASE_AUTH_AUDIENCE: 'authenticated',
        SUPABASE_AUTH_JWKS_URL:
          'http://127.0.0.1:54321/auth/v1/.well-known/jwks.json',
      },
    },
    ...(Array.isArray(pwa.webServer)
      ? pwa.webServer
      : pwa.webServer
        ? [pwa.webServer]
        : []
    ).map((server) => ({
      ...server,
      timeout: 600_000,
      env: {
        ...server.env,
        NEXT_PUBLIC_RUNTIME_ORIGIN: 'http://127.0.0.2:3200',
      },
    })),
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
