import { defineConfig, devices } from '@playwright/test';

const appOrigin = 'http://127.0.0.1:3400';
const apiOrigin = 'http://127.0.0.1:3431';
const authOrigin = 'https://localhost:54322';
const certificate = process.env.CODEQUEST_DOM_AUTH_CERT;
const certificateKey = process.env.CODEQUEST_DOM_AUTH_KEY;
if (!certificate || !certificateKey)
  throw new Error('Run this suite with test:dom-publication');

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/dom-publication-security.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: appOrigin,
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
    ignoreHTTPSErrors: true,
  },
  webServer: [
    {
      command: 'node scripts/learning-auth-fixture.mjs',
      cwd: '../backend',
      url: `${authOrigin}/auth/v1/.well-known/jwks.json`,
      reuseExistingServer: false,
      timeout: 30_000,
      ignoreHTTPSErrors: true,
      env: {
        CODEQUEST_AUTH_ISSUER: `${authOrigin}/auth/v1`,
        CODEQUEST_AUTH_CORS_ORIGIN: appOrigin,
        CODEQUEST_AUTH_PORT: '54322',
        CODEQUEST_AUTH_HTTPS_CERT: certificate,
        CODEQUEST_AUTH_HTTPS_KEY: certificateKey,
      },
    },
    {
      command: 'pnpm build && node dist/main.js',
      cwd: '../backend',
      url: `${apiOrigin}/api/v1/journeys`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NODE_ENV: 'test',
        HOST: '127.0.0.1',
        PORT: '3431',
        RATE_LIMIT_MAX: '10000',
        CORS_ORIGINS: appOrigin,
        DATABASE_URL:
          process.env.DATABASE_TEST_URL ??
          'postgresql://codequest:local-fixture@127.0.0.1:5432/codequest_test',
        SUPABASE_AUTH_ISSUER: `${authOrigin}/auth/v1`,
        SUPABASE_AUTH_AUDIENCE: 'authenticated',
        SUPABASE_AUTH_JWKS_URL: `${authOrigin}/auth/v1/.well-known/jwks.json`,
      },
    },
    {
      command:
        'pnpm build && pnpm exec next start --hostname 0.0.0.0 --port 3400',
      url: `${appOrigin}/login`,
      reuseExistingServer: false,
      timeout: 360_000,
      env: {
        NEXT_PUBLIC_API_URL: apiOrigin,
        NEXT_PUBLIC_SUPABASE_URL: authOrigin,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          'publishable-local-browser-fixture',
        NEXT_PUBLIC_SITE_URL: 'https://codequest.example.test',
        NEXT_PUBLIC_RUNTIME_ORIGIN: 'http://127.0.0.2:3400',
        NEXT_PUBLIC_PREVIEW_ORIGIN: 'http://localhost:3400',
        NEXT_PUBLIC_ANALYTICS_CAPTURE_APPROVED: 'false',
        NEXT_PUBLIC_MONITORING_CAPTURE_APPROVED: 'false',
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
