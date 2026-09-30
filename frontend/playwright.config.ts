import { defineConfig, devices } from '@playwright/test';

const appPort = process.env.CODEQUEST_E2E_APP_PORT ?? '3100';
const previewPort = process.env.CODEQUEST_E2E_PREVIEW_PORT ?? '3101';
const appOrigin = `http://127.0.0.1:${appPort}`;
const runtimeOrigin = `http://localhost:${appPort}`;
const previewOrigin = `http://localhost:${previewPort}`;

export default defineConfig({
  testDir: './e2e',
  testIgnore: [
    '**/pwa.spec.ts',
    '**/foundations.spec.ts',
    '**/capstone.spec.ts',
    '**/analytics.spec.ts',
    '**/learning-journey.spec.ts',
    '**/accessibility.spec.ts',
  ],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL: appOrigin,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: `pnpm exec next dev --hostname 127.0.0.1 --port ${appPort}`,
      url: `${appOrigin}/login`,
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_PUBLIC_API_URL: 'http://127.0.0.1:3001',
        NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54321',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          'publishable-local-browser-fixture',
        NEXT_PUBLIC_SITE_URL: appOrigin,
        NEXT_PUBLIC_RUNTIME_ORIGIN: runtimeOrigin,
        NEXT_PUBLIC_PREVIEW_ORIGIN: previewOrigin,
      },
      timeout: 120_000,
    },
    {
      command: `pnpm exec next dev --hostname localhost --port ${previewPort}`,
      url: `${previewOrigin}/preview/bootstrap.html`,
      reuseExistingServer: !process.env.CI,
      env: {
        CODEQUEST_PREVIEW_BUILD: '1',
        NEXT_PUBLIC_PREVIEW_ORIGIN: previewOrigin,
        NEXT_PUBLIC_RUNTIME_ORIGIN: runtimeOrigin,
      },
      timeout: 120_000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      testMatch: ['**/web-preview.spec.ts', '**/validation-engine.spec.ts'],
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: ['**/web-preview.spec.ts', '**/validation-engine.spec.ts'],
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
