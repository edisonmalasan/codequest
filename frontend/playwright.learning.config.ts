import { defineConfig, devices } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:3200';
const apiOrigin = 'http://127.0.0.1:3001';
const authOrigin = 'http://127.0.0.1:54321';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/learning-journey.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: appOrigin,
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  webServer: [
    {
      command: 'node scripts/learning-auth-fixture.mjs',
      cwd: '../backend',
      url: `${authOrigin}/auth/v1/.well-known/jwks.json`,
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'pnpm build && node dist/test/learning-web-server.js',
      cwd: '../backend',
      url: `${apiOrigin}/api/v1/journeys`,
      reuseExistingServer: false,
      timeout: 90_000,
      env: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: '3001',
        RATE_LIMIT_MAX: '1000',
        CORS_ORIGINS: appOrigin,
        DATABASE_URL: process.env.DATABASE_TEST_URL ?? '',
        DATABASE_TEST_URL: process.env.DATABASE_TEST_URL ?? '',
        SUPABASE_AUTH_ISSUER: `${authOrigin}/auth/v1`,
        SUPABASE_AUTH_AUDIENCE: 'authenticated',
        SUPABASE_AUTH_JWKS_URL: `${authOrigin}/auth/v1/.well-known/jwks.json`,
      },
    },
    {
      command:
        'pnpm exec next build && pnpm exec next start --hostname 0.0.0.0 --port 3200',
      url: `${appOrigin}/register`,
      reuseExistingServer: false,
      timeout: 240_000,
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_API_URL: apiOrigin,
        NEXT_PUBLIC_SUPABASE_URL: authOrigin,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          'publishable-local-browser-fixture',
        NEXT_PUBLIC_SITE_URL: appOrigin,
        NEXT_PUBLIC_RUNTIME_ORIGIN: 'http://127.0.0.2:3200',
        NEXT_PUBLIC_PREVIEW_ORIGIN: 'http://localhost:3200',
      },
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
